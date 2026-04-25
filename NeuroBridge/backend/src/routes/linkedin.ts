import { Router, Request, Response } from 'express';
import { fetchLinkedInUserInfo } from '../services/linkedin';

export const linkedinRouter = Router();

const CLIENT_ID     = process.env.LINKEDIN_CLIENT_ID     ?? '';
const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET ?? '';
const REDIRECT_URI  = process.env.LINKEDIN_REDIRECT_URI  ?? 'http://localhost:4000/api/linkedin/callback';
const FRONTEND_URL  = process.env.FRONTEND_URL           ?? 'http://localhost:5147';

// ── CSRF state store (in-memory, auto-expires after 10 min) ──────────────────
const pendingStates = new Map<string, number>();

function generateState(): string {
  const state = Math.random().toString(36).substring(2, 18);
  pendingStates.set(state, Date.now() + 10 * 60 * 1000); // 10 min TTL
  return state;
}

function verifyState(state: string): boolean {
  const expiry = pendingStates.get(state);
  if (!expiry) return false;
  pendingStates.delete(state);
  return Date.now() < expiry;
}

// Prune expired states every 15 min
setInterval(() => {
  const now = Date.now();
  for (const [state, expiry] of pendingStates.entries()) {
    if (now > expiry) pendingStates.delete(state);
  }
}, 15 * 60 * 1000);


// ── GET /api/linkedin/auth ── Returns OAuth URL for frontend to redirect to ──
linkedinRouter.get('/auth', (_req: Request, res: Response): void => {
  const scopes = ['openid', 'profile', 'email'].join(' ');
  const state  = generateState();

  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id',     CLIENT_ID);
  authUrl.searchParams.set('redirect_uri',  REDIRECT_URI);
  authUrl.searchParams.set('state',         state);
  authUrl.searchParams.set('scope',         scopes);

  res.json({ authUrl: authUrl.toString(), state });
});


// ── GET /api/linkedin/callback ─────────────────────────────────────────────
linkedinRouter.get('/callback', async (req: Request, res: Response): Promise<void> => {
  const { code, state, error, error_description } = req.query as Record<string, string>;

  // User cancelled or LinkedIn returned an error
  if (error) {
    res.redirect(
      `${FRONTEND_URL}/dashboard?linkedin_error=${encodeURIComponent(error_description ?? error)}`
    );
    return;
  }

  // CSRF state check
  if (!state || !verifyState(state)) {
    res.redirect(`${FRONTEND_URL}/dashboard?linkedin_error=${encodeURIComponent('Invalid or expired OAuth state. Please try again.')}`);
    return;
  }

  if (!code) {
    res.status(400).json({ error: 'No authorization code received' });
    return;
  }

  try {
    // ── Step 1: Exchange code → access token ─────────────────────────────
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        redirect_uri:  REDIRECT_URI,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed: ${tokenRes.status}`);
    }

    const tokenData = await tokenRes.json() as {
      access_token?: string;
      expires_in?:   number;
    };
    const accessToken = tokenData.access_token;
    if (!accessToken) throw new Error('No access token in response');

    // ── Step 2: Fetch permitted profile via userinfo endpoint ─────────────
    const profile = await fetchLinkedInUserInfo(accessToken);

    // ── Step 3: Encode minimal payload → redirect to frontend ────────────
    const payload = {
      linkedin_id:   profile.sub,
      name:          profile.name ?? `${profile.given_name ?? ''} ${profile.family_name ?? ''}`.trim(),
      email:         profile.email,
      profile_photo: profile.picture,
      locale:        profile.locale,
      access_token:  accessToken,
      connected_at:  new Date().toISOString(),
    };

    const profileParam = Buffer.from(JSON.stringify(payload)).toString('base64');
    res.redirect(`${FRONTEND_URL}/dashboard?linkedin_connected=1&profile=${profileParam}`);

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'OAuth error';
    console.error('[LinkedIn OAuth]', msg);
    res.redirect(`${FRONTEND_URL}/dashboard?linkedin_error=${encodeURIComponent(msg)}`);
  }
});


// ── GET /api/linkedin/profile ── Re-fetch profile with a stored token ────────
linkedinRouter.get('/profile', async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const data = await fetchLinkedInUserInfo(token);
    res.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Fetch error';
    // 401 from LinkedIn means token expired
    if (msg.includes('401')) {
      res.status(401).json({ error: 'token_expired', message: 'Reconnect your LinkedIn account.' });
    } else {
      res.status(500).json({ error: msg });
    }
  }
});


// ── POST /api/linkedin/update ── Log certificate / skill intent ─────────────
// Note: Live posting to LinkedIn requires Partner Program access (r_member_social scope).
linkedinRouter.post('/update', (req: Request, res: Response): void => {
  const { linkedin_id, skill, certificate } = req.body as {
    linkedin_id?: string;
    skill?:       string;
    certificate?: string;
  };

  if (!linkedin_id) {
    res.status(400).json({ error: 'Missing linkedin_id' });
    return;
  }

  console.log(`[LinkedIn Update] User ${linkedin_id}: skill="${skill}", cert="${certificate}"`);

  res.json({
    success: true,
    message: 'Profile intent recorded. LinkedIn Partner API required for live posting.',
    skill,
    certificate,
  });
});
