import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

export interface User {
  id?: number;
  google_id?: string;
  name: string;
  email: string;
  password?: string;
  profile_picture?: string;
  assessment_completed: boolean;
  assessment_score?: number;
  classification?: string;
  assessment_metrics?: string;
  created_at: string;
}

class DatabaseService {
  private db: Database;

  constructor() {
    this.db = new sqlite3.Database('./neurobridge.db');
    this.initTables();
  }

  private initTables(): void {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        google_id TEXT UNIQUE,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        profile_picture TEXT,
        assessment_completed BOOLEAN DEFAULT 0,
        assessment_score INTEGER,
        classification TEXT,
        assessment_metrics TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createUsersTable, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
      } else {
        console.log('Users table initialized successfully');
        // Ensure assessment_metrics exists on older schema
        this.db.run('ALTER TABLE users ADD COLUMN assessment_metrics TEXT', () => {});
      }
    });
  }

  // Find user by Google ID
  findUserByGoogleId(googleId: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE google_id = ?',
        [googleId],
        (err, row: User) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  // Find user by email
  findUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row: User) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  // Create new user
  createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    return new Promise((resolve, reject) => {
      const { google_id, name, email, profile_picture, assessment_completed = false, assessment_score, classification } = user;
      
      this.db.run(
        'INSERT INTO users (google_id, name, email, profile_picture, assessment_completed, assessment_score, classification) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [google_id, name, email, profile_picture, assessment_completed, assessment_score, classification],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              google_id,
              name,
              email,
              profile_picture,
              assessment_completed,
              assessment_score,
              classification,
              created_at: new Date().toISOString()
            });
          }
        }
      );
    });
  }

  // Update user assessment data
  updateUserAssessment(userId: number, assessmentData: { assessment_completed: boolean; assessment_score?: number; classification?: string; assessment_metrics?: string }): Promise<User> {
    return new Promise((resolve, reject) => {
      const { assessment_completed, assessment_score, classification, assessment_metrics } = assessmentData;
      
      this.db.run(
        'UPDATE users SET assessment_completed = ?, assessment_score = ?, classification = ?, assessment_metrics = ? WHERE id = ?',
        [assessment_completed, assessment_score, classification, assessment_metrics, userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Return updated user
            resolve({
              id: userId,
              google_id: '',
              name: '',
              email: '',
              profile_picture: '',
              assessment_completed,
              assessment_score,
              classification,
              assessment_metrics,
              created_at: ''
            } as User);
          }
        }
      );
    });
  }

  // Get user by ID
  getUserById(userId: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [userId],
        (err, row: User) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  // Create user with email/password
  createUserWithEmail(user: { name: string; email: string; password: string }): Promise<User> {
    return new Promise((resolve, reject) => {
      const { name, email, password } = user;
      
      console.log('Creating user with:', { name, email, passwordLength: password.length });
      
      this.db.run(
        'INSERT INTO users (name, email, password, assessment_completed) VALUES (?, ?, ?, ?)',
        [name, email, password, false],
        function(err) {
          if (err) {
            console.error('Database error creating user:', err);
            reject(err);
          } else {
            console.log('User created successfully with ID:', this.lastID);
            resolve({
              id: this.lastID,
              name,
              email,
              password,
              assessment_completed: false,
              created_at: new Date().toISOString()
            } as User);
          }
        }
      );
    });
  }

  
  // Update user password
  updatePassword(email: string, newPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET password = ? WHERE email = ?',
        [newPassword, email],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  // Update user with Google ID
  updateUserWithGoogle(userId: number, googleId: string, profilePicture: string): Promise<User> {
    return new Promise((resolve, reject) => {
      const db = this.db;
      db.run(
        'UPDATE users SET google_id = ?, profile_picture = ? WHERE id = ?',
        [googleId, profilePicture, userId],
        function(err: any) {
          if (err) {
            reject(err);
          } else {
            // Return updated user
            db.get(
              'SELECT * FROM users WHERE id = ?',
              [userId],
              (err: any, row: User) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(row);
                }
              }
            );
          }
        }
      );
    });
  }

  // Close database connection
  close(): void {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

export default new DatabaseService();
