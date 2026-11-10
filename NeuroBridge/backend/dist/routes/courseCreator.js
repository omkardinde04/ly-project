"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseCreatorRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../auth");
const Course_1 = __importDefault(require("../models/Course"));
const Lesson_1 = __importDefault(require("../models/Lesson"));
const AIValidation_1 = __importDefault(require("../models/AIValidation"));
const aiValidationService_1 = require("../services/aiValidationService");
const router = express_1.default.Router();
// Get creator's courses
router.get('/my-courses', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const courses = await Course_1.default.find({ instructor: req.user.userId }).sort({ created_at: -1 });
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});
// Create a new course skeleton
router.post('/create', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const { title, description, category, difficulty, learningObjectives } = req.body;
        const course = new Course_1.default({
            title,
            description,
            category,
            difficulty,
            learningObjectives: learningObjectives || [],
            instructor: req.user.userId,
            status: 'draft'
        });
        await course.save();
        res.json(course);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create course' });
    }
});
// Add a lesson to a course (simulates upload & AI validation)
router.post('/:courseId/lessons', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const { title, videoUrl } = req.body;
        const course = await Course_1.default.findById(courseId);
        if (!course)
            return res.status(404).json({ error: 'Course not found' });
        if (course.instructor.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        // 1. Extract Transcript
        const transcript = await aiValidationService_1.AIValidationService.extractTranscript(videoUrl);
        // 2. Validate Content
        const validationResult = await aiValidationService_1.AIValidationService.validateContent({
            title,
            category: course.category,
            transcript
        });
        // 3. Save Validation Record
        const validation = new AIValidation_1.default({
            course: course._id,
            primaryCategory: validationResult.primaryCategory,
            categoryScores: validationResult.categoryScores,
            educationalResult: validationResult.educationalResult,
            safetyResult: validationResult.safetyResult,
            titleMatch: validationResult.titleMatch,
            confidence: validationResult.confidence,
            decision: validationResult.decision,
            reason: validationResult.reason
        });
        await validation.save();
        // 4. Update Course Status if rejected
        if (validationResult.decision === 'reject') {
            course.status = 'rejected';
            course.rejectionReason = validationResult.reason;
            course.aiValidationId = validation._id;
            await course.save();
            return res.status(400).json({ error: 'Content rejected by AI validation', validation });
        }
        // 5. Generate Learning Materials
        const materials = await aiValidationService_1.AIValidationService.generateLearningMaterials(transcript, title);
        // 6. Create Lesson
        const lessonCount = await Lesson_1.default.countDocuments({ course: courseId });
        const lesson = new Lesson_1.default({
            course: courseId,
            title,
            videoUrl,
            transcript,
            summary: materials.summary,
            notes: materials.notes,
            chapters: materials.chapters,
            quiz: materials.quiz,
            order: lessonCount + 1,
            duration: 300 // Mock duration
        });
        await lesson.save();
        // 7. Update Course status to pending if it's the first lesson
        if (course.status === 'draft') {
            course.status = 'pending';
            course.aiValidationId = validation._id;
            await course.save();
        }
        res.json({ lesson, validation });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add lesson' });
    }
});
// Submit course for review
router.post('/:courseId/submit', auth_1.AuthService.authenticateToken, async (req, res) => {
    try {
        const course = await Course_1.default.findOneAndUpdate({ _id: req.params.courseId, instructor: req.user.userId }, { status: 'pending' }, { new: true });
        res.json(course);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to submit course' });
    }
});
exports.courseCreatorRouter = router;
