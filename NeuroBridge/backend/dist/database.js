"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("./models/User"));
// Helper to transform mongoose document to plain object
const toUser = (doc) => {
    if (!doc)
        return null;
    const obj = doc.toObject();
    return { ...obj, id: obj._id.toString() };
};
class DatabaseService {
    constructor() {
        console.log('DatabaseService initialized with MongoDB (Mongoose)');
    }
    // Find user by Google ID
    async findUserByGoogleId(googleId) {
        const user = await User_1.default.findOne({ google_id: googleId });
        return toUser(user);
    }
    // Find user by email
    async findUserByEmail(email) {
        const user = await User_1.default.findOne({ email });
        return toUser(user);
    }
    // Create new user (Google)
    async createUser(userData) {
        const user = new User_1.default(userData);
        await user.save();
        return toUser(user);
    }
    // Update user assessment data
    async updateUserAssessment(userId, assessmentData) {
        const user = await User_1.default.findByIdAndUpdate(userId, assessmentData, { new: true });
        return toUser(user);
    }
    // Get user by ID
    async getUserById(userId) {
        const user = await User_1.default.findById(userId);
        return toUser(user);
    }
    // Create user with email/password
    async createUserWithEmail(userData) {
        const user = new User_1.default({
            ...userData,
            assessment_completed: false,
            email_verified: false
        });
        await user.save();
        return toUser(user);
    }
    // Update user password
    async updatePassword(email, newPassword) {
        const result = await User_1.default.updateOne({ email }, { password: newPassword });
        return result.modifiedCount > 0;
    }
    // Update user with Google ID
    async updateUserWithGoogle(userId, googleId, profilePicture) {
        const user = await User_1.default.findByIdAndUpdate(userId, { google_id: googleId, profile_picture: profilePicture }, { new: true });
        return toUser(user);
    }
    // Save verification token
    async saveVerificationToken(email, token, expiryMinutes = 24 * 60) {
        const expiryTime = new Date(Date.now() + expiryMinutes * 60000);
        const result = await User_1.default.updateOne({ email }, { verification_token: token, verification_token_expiry: expiryTime });
        return result.modifiedCount > 0;
    }
    // Verify email token
    async verifyEmailToken(token) {
        const user = await User_1.default.findOne({ verification_token: token, verification_token_expiry: { $gt: new Date() } });
        return toUser(user);
    }
    // Mark email as verified
    async markEmailVerified(userId) {
        const result = await User_1.default.updateOne({ _id: userId.toString() }, { email_verified: true, $unset: { verification_token: 1, verification_token_expiry: 1 } });
        return result.modifiedCount > 0;
    }
    // Save password reset token
    async saveResetToken(email, token, expiryMinutes = 60) {
        const expiryTime = new Date(Date.now() + expiryMinutes * 60000);
        const result = await User_1.default.updateOne({ email }, { reset_token: token, reset_token_expiry: expiryTime });
        return result.modifiedCount > 0;
    }
    // Verify reset token
    async verifyResetToken(token) {
        const user = await User_1.default.findOne({ reset_token: token, reset_token_expiry: { $gt: new Date() } });
        return toUser(user);
    }
    // Reset password with token
    async resetPasswordWithToken(token, newPassword) {
        const result = await User_1.default.updateOne({ reset_token: token, reset_token_expiry: { $gt: new Date() } }, { password: newPassword, $unset: { reset_token: 1, reset_token_expiry: 1 } });
        return result.modifiedCount > 0;
    }
    // Close database connection
    close() {
        console.log('MongoDB connection managed by mongoose, no action needed for user db close');
    }
}
exports.default = new DatabaseService();
