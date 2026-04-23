import { Router, Request, Response } from 'express';
import { fetchLinkedInJobs, applyToLinkedInJob } from '../services/linkedin';
import { fetchUnstopOpportunities, applyToUnstopOpportunity } from '../services/unstop';
import { simplifyOpportunity } from '../services/aiSimplifier';

export const jobsRouter = Router();

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
      rawData = await fetchLinkedInJobs(mockToken);
    } else if (platform === 'unstop') {
      rawData = await fetchUnstopOpportunities(mockToken);
    } else {
      return res.status(400).json({ error: 'Unknown platform' });
    }

    // Run every card through the AI Simplifier pipeline
    const simplified = await Promise.all(
      rawData.map(async (item) => ({
        ...item,
        simplified: await simplifyOpportunity({
          title: item.title,
          company: item.company,
          organization: item.organization,
          location: item.location,
          deadline: item.deadline,
          prize: item.prize,
          description: item.description,
          eligibility: item.eligibility || '',
          type: item.type,
        }),
      }))
    );

    res.json(simplified);
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
