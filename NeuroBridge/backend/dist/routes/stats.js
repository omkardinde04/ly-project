"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsRouter = void 0;
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const AssessmentResult_1 = __importDefault(require("../models/AssessmentResult"));
const LearningProgress_1 = __importDefault(require("../models/LearningProgress"));
const Course_1 = __importDefault(require("../models/Course"));
const Post_1 = __importDefault(require("../models/Post"));
/**
 * Public, anonymous platform numbers for the landing and About pages.
 * Only totals are returned — never names, emails or anything personal.
 * Results are cached for a few minutes so busy pages don't hit the database.
 */
exports.statsRouter = (0, express_1.Router)();
const CACHE_MS = 5 * 60 * 1000;
let cache = null;
async function computeStats() {
    const [students, assessmentRecords, assessedUsers, practice, courses, posts] = await Promise.all([
        User_1.default.countDocuments({}),
        AssessmentResult_1.default.countDocuments({}),
        User_1.default.countDocuments({ assessment_completed: true }),
        LearningProgress_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    seconds: {
                        $sum: {
                            $add: [
                                { $ifNull: ['$skills.sound.totalSeconds', 0] },
                                { $ifNull: ['$skills.focus.totalSeconds', 0] },
                                { $ifNull: ['$skills.memory.totalSeconds', 0] },
                                { $ifNull: ['$skills.speed.totalSeconds', 0] },
                            ],
                        },
                    },
                },
            },
        ]),
        Course_1.default.countDocuments({ status: 'approved' }),
        Post_1.default.countDocuments({}),
    ]);
    return {
        students,
        // Saved results include retakes; older accounts may only have the flag on the user
        assessments: Math.max(assessmentRecords, assessedUsers),
        practiceMinutes: Math.round((practice[0]?.seconds ?? 0) / 60),
        courses,
        posts,
        updatedAt: new Date().toISOString(),
    };
}
// GET /api/stats/public
exports.statsRouter.get('/public', async (_req, res) => {
    try {
        if (!cache || Date.now() - cache.at > CACHE_MS) {
            cache = { at: Date.now(), data: await computeStats() };
        }
        res.set('Cache-Control', 'public, max-age=300');
        res.json(cache.data);
    }
    catch (error) {
        console.error('Public stats error:', error);
        // Serve the last good numbers if the database hiccups
        if (cache)
            return res.json(cache.data);
        res.status(503).json({ error: 'Stats are not available right now' });
    }
});
