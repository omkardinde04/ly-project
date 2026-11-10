"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsRouter = void 0;
const express_1 = require("express");
const linkedin_1 = require("../services/linkedin");
const unstop_1 = require("../services/unstop");
const aiSimplifier_1 = require("../services/aiSimplifier");
exports.jobsRouter = (0, express_1.Router)();
// ─── On-demand simplify (called directly from frontend card/modal) ─────────────
exports.jobsRouter.post('/simplify', async (req, res) => {
    const raw = req.body;
    if (!raw || !raw.title || !raw.description) {
        return res.status(400).json({ error: 'title and description are required.' });
    }
    try {
        const result = await (0, aiSimplifier_1.simplifyOpportunity)(raw);
        res.json(result);
    }
    catch (error) {
        console.error('Simplify error:', error.message);
        res.status(500).json({ error: 'Simplification failed.' });
    }
});
// ─── Connect accounts ─────────────────────────────────────────────────────────
exports.jobsRouter.post('/connect/:platform', async (req, res) => {
    const { platform } = req.params;
    // In production: initiate OAuth here (LinkedIn OAuth2 flow)
    // For now: return success to unblock the frontend UX
    res.json({ success: true, message: `Connected to ${platform}`, platform });
});
// ─── Fetch jobs / opportunities ───────────────────────────────────────────────
exports.jobsRouter.get('/:platform/jobs', async (req, res) => {
    const { platform } = req.params;
    const mockToken = { accessToken: 'mock-token' };
    try {
        let rawData = [];
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
        }
        else if (platform === 'unstop') {
            rawData = await (0, unstop_1.fetchUnstopOpportunities)(mockToken);
        }
        else {
            return res.status(400).json({ error: 'Unknown platform' });
        }
        // Return the raw data directly — frontend will handle the "Simplify with AI" click
        res.json(rawData);
    }
    catch (error) {
        console.error(`Failed to fetch ${platform} jobs:`, error.message);
        res.status(500).json({ error: 'Failed to fetch opportunities' });
    }
});
// ─── Apply inside the app ─────────────────────────────────────────────────────
exports.jobsRouter.post('/:platform/apply', async (req, res) => {
    const { platform } = req.params;
    const { jobId, userProfile } = req.body;
    try {
        let result;
        if (platform === 'linkedin') {
            result = await (0, linkedin_1.applyToLinkedInJob)(jobId, userProfile || { name: 'User' });
        }
        else if (platform === 'unstop') {
            result = await (0, unstop_1.applyToUnstopOpportunity)(jobId, userProfile || { name: 'User' });
        }
        else {
            return res.status(400).json({ error: 'Unknown platform' });
        }
        res.json(result);
    }
    catch (error) {
        console.error(`Failed to apply on ${platform}:`, error.message);
        res.status(500).json({ error: 'Failed to apply' });
    }
});
