"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../auth");
const Course_1 = __importDefault(require("../models/Course"));
const router = express_1.default.Router();
// Middleware to check admin status
// Note: In a real app, this should verify user roles. Mocking for now based on auth.
const requireAdmin = (req, res, next) => {
    if (!req.user)
        return res.status(401).json({ error: 'Unauthorized' });
    // Mock admin check: allowing any logged-in user for prototype, or could check specific email.
    next();
};
// Get pending courses
router.get('/pending-courses', auth_1.AuthService.authenticateToken, requireAdmin, async (req, res) => {
    try {
        const courses = await Course_1.default.find({ status: 'pending' })
            .populate('instructor', 'name email')
            .populate('aiValidationId');
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending courses' });
    }
});
// Approve a course
router.post('/courses/:id/approve', auth_1.AuthService.authenticateToken, requireAdmin, async (req, res) => {
    try {
        const course = await Course_1.default.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
        res.json(course);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to approve course' });
    }
});
// Reject a course
router.post('/courses/:id/reject', auth_1.AuthService.authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        const course = await Course_1.default.findByIdAndUpdate(req.params.id, {
            status: 'rejected',
            rejectionReason: reason || 'Rejected by administrator'
        }, { new: true });
        res.json(course);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to reject course' });
    }
});
exports.adminRouter = router;
