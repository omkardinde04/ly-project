"use strict";
// ─── LinkedIn API helpers ─────────────────────────────────────────────────────
// Only uses the officially permitted userinfo endpoint (openid, profile, email).
// No scraping, no connections, no experience — per LinkedIn API policy.
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyToLinkedInJob = void 0;
exports.fetchLinkedInUserInfo = fetchLinkedInUserInfo;
exports.extractSuggestedSkills = extractSuggestedSkills;
/**
 * Fetches the allowed profile fields from LinkedIn's OpenID Connect userinfo endpoint.
 * Requires scopes: openid, profile, email.
 */
async function fetchLinkedInUserInfo(accessToken) {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
        throw new Error(`LinkedIn userinfo fetch failed: ${response.status}`);
    }
    return response.json();
}
/**
 * Extracts suggested skills/interests from available profile fields.
 * Since headline is not available via basic scopes, we derive hints from name + email domain.
 */
function extractSuggestedSkills(name, email) {
    const suggestions = [];
    const nameLower = name.toLowerCase();
    // Creative / design signals
    if (/design|art|creative|visual|ux|ui/i.test(nameLower)) {
        suggestions.push('Design', 'UX/UI', 'Figma');
    }
    if (email) {
        const domain = email.split('@')[1] ?? '';
        // Student emails
        if (/edu|ac\.in|college|university/i.test(domain)) {
            suggestions.push('Academic Research', 'Student Projects');
        }
    }
    // Always suggest accessibility as a universal skill for platform context
    suggestions.push('Accessibility Awareness', 'Inclusive Learning');
    return [...new Set(suggestions)]; // deduplicate
}
// ─── Stub: Apply to job ───────────────────────────────────────────────────────
// Note: LinkedIn Easy Apply API requires Partner Program access.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applyToLinkedInJob = async (jobId, userProfile) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log(`[LinkedIn] Apply intent for job ${jobId} by ${userProfile.name}`);
    return { success: true, message: 'Application recorded. LinkedIn Easy Apply requires Partner API access.' };
};
exports.applyToLinkedInJob = applyToLinkedInJob;
