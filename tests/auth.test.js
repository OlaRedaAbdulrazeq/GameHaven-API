import dotenv from 'dotenv';
dotenv.config();

// Override MONGO_URI to use the test database defined in .env
process.env.MONGO_URI = process.env.MONGO_URI_TEST;
process.env.NODE_ENV = 'test';

import request from 'supertest';
import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import app from '../app.js';
import mongoose from 'mongoose';
import User from '../models/userModel.js';

const originalProcessEnv = { ...process.env };

describe('Auth Flow Integration Tests (with real DB and JWT)', () => {
  beforeAll(async () => {
    // Check if Mongoose is already connected (readyState 1 = connected)
    if (mongoose.connection.readyState !== 1) {
      try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected for tests: ${mongoose.connection.host}`);
      } catch (error) {
        console.error('Failed to connect to MongoDB for tests:', error);
        process.exit(1);
      }
    } else {
      console.log(
        `MongoDB already connected for tests: ${mongoose.connection.host}`
      );
    }
  }, 20000);

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    console.log('MongoDB disconnected after tests');
    process.env = originalProcessEnv;
  });

  // --- Register Tests ---
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully with default role', async () => {
      const newUserPayload = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(newUserPayload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.data).toHaveProperty('token');
      expect(typeof res.body.data.token).toBe('string');
      expect(res.body.data.email).toBe(newUserPayload.email);
      expect(res.body.data.name).toBe(newUserPayload.name);
      expect(res.body.data.role).toBe('user');
      expect(res.body.data).not.toHaveProperty('password');

      const foundUser = await User.findOne({ email: newUserPayload.email });
      expect(foundUser).not.toBeNull();
      expect(foundUser.email).toBe(newUserPayload.email);
      expect(foundUser.name).toBe(newUserPayload.name);
      expect(foundUser.role).toBe('user');
      expect(foundUser.password).not.toBe(newUserPayload.password);
      // TODO:invistigate why this is undefiend
      // expect(await foundUser.matchPassword(newUserPayload.password)).toBe(true);
    });

    it('should register a new user successfully with a specified role', async () => {
      const newUserPayload = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpassword',
        role: 'admin',
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(newUserPayload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('admin');

      const foundUser = await User.findOne({ email: newUserPayload.email });
      expect(foundUser.role).toBe('admin');
    });

    it('should return 400 if email already exists', async () => {
      const existingUserPayload = {
        name: 'Existing User',
        email: 'alreadyexists@example.com',
        password: 'password123',
      };
      // First, register the user to make the email exist in the DB
      await request(app)
        .post('/api/auth/register')
        .send(existingUserPayload)
        .expect(201);

      // Then, attempt to register with the same email again
      const res = await request(app)
        .post('/api/auth/register')
        .send(existingUserPayload)
        .expect(400); // Expect HTTP 400 Bad Request

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('User already exists with this email');
      // Ensure no new user was created
      const userCount = await User.countDocuments({
        email: existingUserPayload.email,
      });
      expect(userCount).toBe(1);
    });

    it('should return 400 for missing name field', async () => {
      const invalidPayload = {
        email: 'test@example.com',
        password: 'password123',
      };
      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidPayload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Name is required');
    });

    it('should return 400 for invalid email format', async () => {
      const invalidPayload = {
        name: 'Test User',
        email: 'invalid-email', // Invalid email format
        password: 'password123',
      };
      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidPayload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Please provide a valid email');
    });

    it('should return 400 for password less than 6 characters', async () => {
      const invalidPayload = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'short', // Password is too short
      };
      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidPayload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain(
        'Password must be at least 6 characters long'
      );
    });

    it('should return 400 for invalid role value', async () => {
      const invalidPayload = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'superadmin', // Invalid role as per authValidators.js
      };
      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidPayload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid role');
    });
  });

  // --- Login Tests ---
  describe('POST /api/auth/login', () => {
    // Define a test user that will be registered before login tests
    const testUser = {
      name: 'Login User',
      email: 'login@example.com',
      password: 'loginpassword123',
    };

    // beforeEach: Register the test user before each login test
    // This ensures that the user attempting to log in actually exists in the DB.
    beforeEach(async () => {
      await User.deleteMany({}); // Ensure clean state before registering
      await request(app).post('/api/auth/register').send(testUser).expect(201); // Register the user successfully
    });

    it('should login a user successfully with correct credentials', async () => {
      const loginCredentials = {
        email: testUser.email,
        password: testUser.password,
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials)
        .expect(200); // Expect HTTP 200 OK

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.data).toHaveProperty('token');
      expect(typeof res.body.data.token).toBe('string');
      expect(res.body.data.email).toBe(loginCredentials.email);
      expect(res.body.data).not.toHaveProperty('password'); // Password should be excluded
    });

    it('should return 401 for invalid credentials (wrong password)', async () => {
      const loginCredentials = {
        email: testUser.email,
        password: 'wrongpassword',
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid email or password');
    });

    it('should return 401 for invalid credentials (email not found)', async () => {
      const loginCredentials = {
        email: 'nonexistent@example.com', // This user does not exist in the DB
        password: 'somepassword',
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginCredentials)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid email or password');
    });

    it('should return 400 for missing email field', async () => {
      const invalidPayload = {
        password: 'password123', // Missing email
      };
      const res = await request(app)
        .post('/api/auth/login')
        .send(invalidPayload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Please provide a valid email');
    });

    it('should return 400 for missing password field', async () => {
      const invalidPayload = {
        email: 'test@example.com', // Missing password
      };
      const res = await request(app)
        .post('/api/auth/login')
        .send(invalidPayload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Password is required');
    });
  });
});
