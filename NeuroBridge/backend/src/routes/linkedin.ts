import { Router, Request, Response } from 'express';

export const linkedinRouter = Router();

const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET ?? '';
// For local dev, use localhost. In production, use your deployed domain.
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI ?? 'http://localhost:4000/api/linkedin/callback';
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

// ── GET /api/linkedin/auth — returns OAuth URL for frontend redirect ──────
linkedinRouter.get('/auth', (_req: Request, res: Response): void => {
  const scopes = ['openid', 'profile', 'email'].join(' ');
  const state = Math.random().toString(36).substring(2, 15);

  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('scope', scopes);

  res.json({ authUrl: authUrl.toString(), state });
});

// ── GET /api/linkedin/callback — exchanges code for token + fetches profile ──
linkedinRouter.get('/callback', async (req: Request, res: Response): Promise<void> => {
  const { code, error, error_description } = req.query as Record<string, string>;

  if (error) {
    res.redirect(`${FRONTEND_URL}/dashboard?linkedin_error=${encodeURIComponent(error_description ?? error)}`);
    return;
  }

  if (!code) {
    res.status(400).json({ error: 'No authorization code received' });
    return;
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json() as { access_token?: string; expires_in?: number };
    const accessToken = tokenData.access_token;

    if (!accessToken) throw new Error('No access token in response');

    // Fetch profile using OpenID Connect userinfo endpoint
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const profile = await profileResponse.json() as {
      sub?: string;
      name?: string;
      given_name?: string;
      family_name?: string;
      email?: string;
      picture?: string;
      locale?: { country?: string; language?: string };
    };

    // Encode profile as base64 param (no session storage in this simple setup)
    const profileParam = Buffer.from(JSON.stringify({
      linkedin_id: profile.sub,
      name: profile.name ?? `${profile.given_name ?? ''} ${profile.family_name ?? ''}`.trim(),
      email: profile.email,
      profile_photo: profile.picture,
      access_token: accessToken,
    })).toString('base64');

    // Redirect to frontend dashboard with profile data
    res.redirect(`${FRONTEND_URL}/dashboard?linkedin_connected=1&profile=${profileParam}`);

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'OAuth error';
    console.error('[LinkedIn OAuth]', msg);
    res.redirect(`${FRONTEND_URL}/dashboard?linkedin_error=${encodeURIComponent(msg)}`);
  }
});

// ── POST /api/linkedin/update — post certificate/skill to LinkedIn ─────────
linkedinRouter.post('/update', async (req: Request, res: Response): Promise<void> => {
  const { access_token, linkedin_id, skill, certificate } = req.body as {
    access_token?: string;
    linkedin_id?: string;
    skill?: string;
    certificate?: string;
  };

  if (!access_token || !linkedin_id) {
    res.status(400).json({ error: 'Missing access_token or linkedin_id' });
    return;
  }

  // LinkedIn's Skills/Certificate API requires Partner Program access.
  // For non-partners, we return a success mock and log the intention.
  console.log(`[LinkedIn Update] User ${linkedin_id}: skill="${skill}", cert="${certificate}"`);

  res.json({
    success: true,
    message: 'Profile update recorded. LinkedIn Partner API required for live posting.',
    skill,
    certificate,
  });
});

// ── GET /api/linkedin/profile/:token — re-fetch profile with stored token ───
linkedinRouter.get('/profile', async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { res.status(401).json({ error: 'No token provided' }); return; }

  try {
    const r = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    res.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Fetch error';
    res.status(500).json({ error: msg });
  }
});
