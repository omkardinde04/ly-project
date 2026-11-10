"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.connectToDatabase = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const jobs_1 = require("./routes/jobs");
const auth_1 = require("./routes/auth");
const llm_1 = require("./routes/llm");
const linkedin_1 = require("./routes/linkedin");
const brain_1 = require("./routes/brain");
const googleAuth_1 = require("./routes/googleAuth");
const emailAuth_1 = require("./routes/emailAuth");
const progress_1 = require("./routes/progress");
const resume_1 = require("./routes/resume");
const community_1 = require("./routes/community");
const courses_1 = require("./routes/courses");
const courseCreator_1 = require("./routes/courseCreator");
const admin_1 = require("./routes/admin");
const stats_1 = require("./routes/stats");
const adaptivePractice_1 = require("./routes/adaptivePractice");
const PORT = process.env.PORT || 4000;
const geminiKey = process.env.GEMINI_API_KEY;
const linkedinId = process.env.LINKEDIN_CLIENT_ID;
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  NeuroBridge Backend Starting…');
console.log(`  Port        : ${PORT}`);
console.log(`  Gemini Key  : ${geminiKey ? '✅ Loaded (ends …' + geminiKey.slice(-6) + ')' : '❌ NOT FOUND'}`);
console.log(`  LinkedIn ID : ${linkedinId ? '✅ Loaded' : '❌ NOT FOUND'}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
const mongoose_1 = __importDefault(require("mongoose"));
const app = (0, express_1.default)();
exports.app = app;
// Trust proxy for Vercel / reverse proxy deployments
app.set('trust proxy', 1);
// Database connection helper for serverless & local
let isDbConnected = false;
const connectToDatabase = async () => {
    if (isDbConnected || mongoose_1.default.connection.readyState >= 1) {
        isDbConnected = true;
        return;
    }
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/neurobridge';
    try {
        await mongoose_1.default.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        isDbConnected = true;
        console.log(`✅ Connected to MongoDB at ${mongoUri}`);
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
    }
};
exports.connectToDatabase = connectToDatabase;
// Ensure database is connected for every request
app.use(async (_req, _res, next) => {
    await (0, exports.connectToDatabase)();
    next();
});
// Session middleware
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production' && !process.env.DEV_MODE,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
// Passport middleware
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
// Routes
app.use('/api/opportunities', jobs_1.jobsRouter);
app.use('/api/auth', auth_1.authRouter);
app.use('/api/auth/google', googleAuth_1.googleAuthRouter);
app.use('/api/auth/email', emailAuth_1.emailAuthRouter);
app.use('/api/llm', llm_1.llmRouter);
app.use('/api/linkedin', linkedin_1.linkedinRouter);
app.use('/api/brain', brain_1.brainRouter);
app.use('/api/progress', progress_1.progressRouter);
app.use('/api/game-zone', progress_1.progressRouter);
app.use('/api/progress/adaptive', adaptivePractice_1.adaptivePracticeRouter);
app.use('/api/game-zone/adaptive', adaptivePractice_1.adaptivePracticeRouter);
app.use('/api/resume', resume_1.resumeRouter);
app.use('/api/community', community_1.communityRouter);
app.use('/api/courses', courses_1.courseRouter);
app.use('/api/creator', courseCreator_1.courseCreatorRouter);
app.use('/api/admin', admin_1.adminRouter);
app.use('/api/stats', stats_1.statsRouter);
app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'NeuroBridge backend', health: '/health' });
});
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Start standalone server locally; on Vercel the app is invoked serverless
const startServer = async () => {
    try {
        await (0, exports.connectToDatabase)();
        app.listen(PORT, () => {
            console.log(`✅ Backend server running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
    }
};
if (!process.env.VERCEL) {
    startServer();
}
// Export app for both ES modules and CommonJS Vercel serverless handlers
module.exports = app;
module.exports.default = app;
module.exports.app = app;
exports.default = app;
