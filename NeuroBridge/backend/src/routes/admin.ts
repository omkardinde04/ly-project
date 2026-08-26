import express from 'express';
import { AuthService } from '../auth'; 
import Course from '../models/Course';
import AIValidation from '../models/AIValidation';

const router = express.Router();

// Middleware to check admin status
// Note: In a real app, this should verify user roles. Mocking for now based on auth.
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  // Mock admin check: allowing any logged-in user for prototype, or could check specific email.
  next();
};

// Get pending courses
router.get('/pending-courses', AuthService.authenticateToken, requireAdmin, async (req, res) => {
  try {
    const courses = await Course.find({ status: 'pending' })
      .populate('instructor', 'name email')
      .populate('aiValidationId');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending courses' });
  }
});

// Approve a course
router.post('/courses/:id/approve', AuthService.authenticateToken, requireAdmin, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve course' });
  }
});

// Reject a course
router.post('/courses/:id/reject', AuthService.authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const course = await Course.findByIdAndUpdate(req.params.id, { 
      status: 'rejected',
      rejectionReason: reason || 'Rejected by administrator'
    }, { new: true });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject course' });
  }
});

export const adminRouter = router;
