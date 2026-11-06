import { Router, Request, Response } from 'express';
import UserModel from '../models/User';
import AssessmentResult from '../models/AssessmentResult';
import LearningProgress from '../models/LearningProgress';
import Course from '../models/Course';
import Post from '../models/Post';

/**
 * Public, anonymous platform numbers for the landing and About pages.
 * Only totals are returned — never names, emails or anything personal.
 * Results are cached for a few minutes so busy pages don't hit the database.
 */
export const statsRouter = Router();

interface PublicStats {
  students: number; // accounts created
  assessments: number; // assessments completed (retakes included)
  practiceMinutes: number; // total time spent in the learning games
  courses: number; // approved courses
  posts: number; // community posts
  updatedAt: string;
}

const CACHE_MS = 5 * 60 * 1000;
let cache: { at: number; data: PublicStats } | null = null;

async function computeStats(): Promise<PublicStats> {
  const [students, assessmentRecords, assessedUsers, practice, courses, posts] = await Promise.all([
    UserModel.countDocuments({}),
    AssessmentResult.countDocuments({}),
    UserModel.countDocuments({ assessment_completed: true }),
    LearningProgress.aggregate<{ seconds: number }>([
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
    Course.countDocuments({ status: 'approved' }),
    Post.countDocuments({}),
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
statsRouter.get('/public', async (_req: Request, res: Response) => {
  try {
    if (!cache || Date.now() - cache.at > CACHE_MS) {
      cache = { at: Date.now(), data: await computeStats() };
    }
    res.set('Cache-Control', 'public, max-age=300');
    res.json(cache.data);
  } catch (error) {
    console.error('Public stats error:', error);
    // Serve the last good numbers if the database hiccups
    if (cache) return res.json(cache.data);
    res.status(503).json({ error: 'Stats are not available right now' });
  }
});
