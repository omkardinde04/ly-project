import express from 'express';
import { AuthService } from '../auth'; 
import Course from '../models/Course';
import Lesson from '../models/Lesson';
import Enrollment from '../models/Enrollment';
import Recommendation from '../models/Recommendation';
import User from '../models/User';

const router = express.Router();

// Get all approved courses (with optional category/search filters)
router.get('/', AuthService.authenticateToken, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query: any = { status: 'approved' };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name profile_picture')
      .sort({ created_at: -1 })
      .limit(20);
      
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get user's active enrollments
router.get('/enrollments', AuthService.authenticateToken, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: (req.user as any).userId })
      .populate({
        path: 'course',
        populate: { path: 'instructor', select: 'name' }
      })
      .populate('lastLesson');
      
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// Get course detail and lessons
router.get('/:id', AuthService.authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name profile_picture');
      
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 });
    
    // Check if enrolled
    const enrollment = await Enrollment.findOne({ user: (req.user as any).userId, course: course._id });
    
    res.json({ course, lessons, enrollment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// Enroll in a course
router.post('/:id/enroll', AuthService.authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = (req.user as any).userId;
    
    let enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    
    if (!enrollment) {
      enrollment = new Enrollment({
        user: userId,
        course: courseId,
        progress: 0,
        completedLessons: []
      });
      await enrollment.save();
      
      await Course.findByIdAndUpdate(courseId, { $inc: { learnerCount: 1 } });
    }
    
    res.json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enroll' });
  }
});

// Update lesson progress
router.post('/:courseId/lessons/:lessonId/progress', AuthService.authenticateToken, async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { completed, timeSpent } = req.body;
    const userId = (req.user as any).userId;
    
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) return res.status(404).json({ error: 'Not enrolled' });
    
    if (timeSpent) {
      enrollment.timeSpent += timeSpent;
    }
    
    enrollment.lastLesson = lessonId as any;
    
    if (completed && !enrollment.completedLessons.includes(lessonId as any)) {
      enrollment.completedLessons.push(lessonId as any);
      
      const totalLessons = await Lesson.countDocuments({ course: courseId });
      enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
      
      if (enrollment.progress >= 100 && !enrollment.completion_date) {
        enrollment.completion_date = new Date();
      }
    }
    
    await enrollment.save();
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

export const courseRouter = router;
