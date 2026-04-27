import UserModel, { IUser } from './models/User';

export interface User {
  id?: string | number; // Support string for MongoDB ObjectID
  google_id?: string;
  name: string;
  email: string;
  password?: string;
  profile_picture?: string;
  assessment_completed: boolean;
  assessment_score?: number;
  classification?: string;
  assessment_metrics?: string;
  email_verified: boolean;
  verification_token?: string;
  verification_token_expiry?: string | Date;
  reset_token?: string;
  reset_token_expiry?: string | Date;
  created_at: string | Date;
}

// Helper to transform mongoose document to plain object
const toUser = (doc: IUser | null): User | null => {
  if (!doc) return null;
  const obj = doc.toObject();
  return { ...obj, id: obj._id.toString() } as User;
};

class DatabaseService {
  constructor() {
    console.log('DatabaseService initialized with MongoDB (Mongoose)');
  }

  // Find user by Google ID
  async findUserByGoogleId(googleId: string): Promise<User | null> {
    const user = await UserModel.findOne({ google_id: googleId });
    return toUser(user);
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return toUser(user);
  }

  // Create new user (Google)
  async createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const user = new UserModel(userData);
    await user.save();
    return toUser(user)!;
  }

  // Update user assessment data
  async updateUserAssessment(userId: string | number, assessmentData: { assessment_completed: boolean; assessment_score?: number; classification?: string; assessment_metrics?: string }): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(userId, assessmentData, { new: true });
    return toUser(user)!;
  }

  // Get user by ID
  async getUserById(userId: string | number): Promise<User | null> {
    const user = await UserModel.findById(userId);
    return toUser(user);
  }

  // Create user with email/password
  async createUserWithEmail(userData: { name: string; email: string; password: string }): Promise<User> {
    const user = new UserModel({
      ...userData,
      assessment_completed: false,
      email_verified: false
    });
    await user.save();
    return toUser(user)!;
  }

  // Update user password
  async updatePassword(email: string, newPassword: string): Promise<boolean> {
    const result = await UserModel.updateOne({ email }, { password: newPassword });
    return result.modifiedCount > 0;
  }

  // Update user with Google ID
  async updateUserWithGoogle(userId: string | number, googleId: string, profilePicture: string): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(userId, { google_id: googleId, profile_picture: profilePicture }, { new: true });
    return toUser(user)!;
  }

  // Save verification token
  async saveVerificationToken(email: string, token: string, expiryMinutes: number = 24 * 60): Promise<boolean> {
    const expiryTime = new Date(Date.now() + expiryMinutes * 60000);
    const result = await UserModel.updateOne({ email }, { verification_token: token, verification_token_expiry: expiryTime });
    return result.modifiedCount > 0;
  }

  // Verify email token
  async verifyEmailToken(token: string): Promise<User | null> {
    const user = await UserModel.findOne({ verification_token: token, verification_token_expiry: { $gt: new Date() } });
    return toUser(user);
  }

  // Mark email as verified
  async markEmailVerified(userId: string | number): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId.toString() },
      { email_verified: true, $unset: { verification_token: 1, verification_token_expiry: 1 } }
    );
    return result.modifiedCount > 0;
  }

  // Save password reset token
  async saveResetToken(email: string, token: string, expiryMinutes: number = 60): Promise<boolean> {
    const expiryTime = new Date(Date.now() + expiryMinutes * 60000);
    const result = await UserModel.updateOne({ email }, { reset_token: token, reset_token_expiry: expiryTime });
    return result.modifiedCount > 0;
  }

  // Verify reset token
  async verifyResetToken(token: string): Promise<User | null> {
    const user = await UserModel.findOne({ reset_token: token, reset_token_expiry: { $gt: new Date() } });
    return toUser(user);
  }

  // Reset password with token
  async resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
    const result = await UserModel.updateOne(
      { reset_token: token, reset_token_expiry: { $gt: new Date() } },
      { password: newPassword, $unset: { reset_token: 1, reset_token_expiry: 1 } }
    );
    return result.modifiedCount > 0;
  }

  // Close database connection
  close(): void {
    console.log('MongoDB connection managed by mongoose, no action needed for user db close');
  }
}

export default new DatabaseService();
