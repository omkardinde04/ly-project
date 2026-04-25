import { Router, Request, Response } from 'express';
import { applyToLinkedInJob } from '../services/linkedin';
import { fetchUnstopOpportunities, applyToUnstopOpportunity } from '../services/unstop';
import { simplifyOpportunity } from '../services/aiSimplifier';

export const jobsRouter = Router();

// ─── On-demand simplify (called directly from frontend card/modal) ─────────────
jobsRouter.post('/simplify', async (req: Request, res: Response) => {
  const raw = req.body;
  if (!raw || !raw.title || !raw.description) {
    return res.status(400).json({ error: 'title and description are required.' });
  }
  try {
    const result = await simplifyOpportunity(raw);
    res.json(result);
  } catch (error: any) {
    console.error('Simplify error:', error.message);
    res.status(500).json({ error: 'Simplification failed.' });
  }
});

// ─── Connect accounts ─────────────────────────────────────────────────────────
jobsRouter.post('/connect/:platform', async (req: Request, res: Response) => {
  const { platform } = req.params;
  // In production: initiate OAuth here (LinkedIn OAuth2 flow)
  // For now: return success to unblock the frontend UX
  res.json({ success: true, message: `Connected to ${platform}`, platform });
});

// ─── Fetch jobs / opportunities ───────────────────────────────────────────────
jobsRouter.get('/:platform/jobs', async (req: Request, res: Response) => {
  const { platform } = req.params;
  const mockToken = { accessToken: 'mock-token' };

  try {
    let rawData: any[] = [];

    if (platform === 'linkedin') {
      // Mock LinkedIn jobs data since fetchLinkedInJobs doesn't exist
      rawData = [
        {
          id: '1',
          title: 'Software Engineer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          description: 'Looking for a skilled software engineer...'
        },
        {
          id: '2', 
          title: 'UX Designer',
          company: 'Design Studio',
          location: 'New York, NY',
          description: 'Join our team as a UX designer...'
        }
      ];
    } else if (platform === 'unstop') {
      rawData = await fetchUnstopOpportunities(mockToken);
    } else {
      return res.status(400).json({ error: 'Unknown platform' });
    }

    // Return the raw data directly — frontend will handle the "Simplify with AI" click
    res.json(rawData);
  } catch (error: any) {
    console.error(`Failed to fetch ${platform} jobs:`, error.message);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// ─── Apply inside the app ─────────────────────────────────────────────────────
jobsRouter.post('/:platform/apply', async (req: Request, res: Response) => {
  const { platform } = req.params;
  const { jobId, userProfile } = req.body;

  try {
    let result;
    if (platform === 'linkedin') {
      result = await applyToLinkedInJob(jobId, userProfile || { name: 'User' });
    } else if (platform === 'unstop') {
      result = await applyToUnstopOpportunity(jobId, userProfile || { name: 'User' });
    } else {
      return res.status(400).json({ error: 'Unknown platform' });
    }
    res.json(result);
  } catch (error: any) {
    console.error(`Failed to apply on ${platform}:`, error.message);
    res.status(500).json({ error: 'Failed to apply' });
  }
});
