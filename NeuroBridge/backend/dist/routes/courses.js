"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../auth");
const Course_1 = __importDefault(require("../models/Course"));
const Lesson_1 = __importDefault(require("../models/Lesson"));
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const router = express_1.default.Router();
// Get all approved courses (with optional category/search filters)
router.get('/', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = { status: 'approved' };
        if (category && category !== 'All') {
            query.category = category;
        }
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        const courses = await Course_1.default.find(query)
            .populate('instructor', 'name profile_picture')
            .sort({ created_at: -1 })
            .limit(20);
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});
// Get user's active enrollments
router.get('/enrollments', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const enrollments = await Enrollment_1.default.find({ user: req.user.userId })
            .populate({
            path: 'course',
            populate: { path: 'instructor', select: 'name' }
        })
            .populate('lastLesson');
        res.json(enrollments);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
});
// Get course detail and lessons
router.get('/:id', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const course = await Course_1.default.findById(req.params.id)
            .populate('instructor', 'name profile_picture');
        if (!course)
            return res.status(404).json({ error: 'Course not found' });
        const lessons = await Lesson_1.default.find({ course: course._id }).sort({ order: 1 });
        // Check if enrolled
        const enrollment = await Enrollment_1.default.findOne({ user: req.user.userId, course: course._id });
        res.json({ course, lessons, enrollment });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch course details' });
    }
});
// Enroll in a course
router.post('/:id/enroll', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.user.userId;
        let enrollment = await Enrollment_1.default.findOne({ user: userId, course: courseId });
        if (!enrollment) {
            enrollment = new Enrollment_1.default({
                user: userId,
                course: courseId,
                progress: 0,
                completedLessons: []
            });
            await enrollment.save();
            await Course_1.default.findByIdAndUpdate(courseId, { $inc: { learnerCount: 1 } });
        }
        res.json({ success: true, enrollment });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to enroll' });
    }
});
// Update lesson progress
router.post('/:courseId/lessons/:lessonId/progress', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const { courseId, lessonId } = req.params;
        const { completed, timeSpent } = req.body;
        const userId = req.user.userId;
        const enrollment = await Enrollment_1.default.findOne({ user: userId, course: courseId });
        if (!enrollment)
            return res.status(404).json({ error: 'Not enrolled' });
        if (timeSpent) {
            enrollment.timeSpent += timeSpent;
        }
        enrollment.lastLesson = lessonId;
        if (completed && !enrollment.completedLessons.includes(lessonId)) {
            enrollment.completedLessons.push(lessonId);
            const totalLessons = await Lesson_1.default.countDocuments({ course: courseId });
            enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
            if (enrollment.progress >= 100 && !enrollment.completion_date) {
                enrollment.completion_date = new Date();
            }
        }
        await enrollment.save();
        res.json(enrollment);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update progress' });
    }
});
exports.courseRouter = router;
