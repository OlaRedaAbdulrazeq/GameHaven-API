import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import mongoose from 'mongoose';
import app from '../server.js'; // or wherever your express app is exported
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI_TEST = process.env.MONGO_URI_TEST || 'your-test-uri-here';
let userToken;
let createdGameId;

beforeAll(async () => {
  // Signup & login to get token
  await request(app).post('/api/auth/register').send({
    name: 'testuser',
    email: 'testuser@example.com',
    password: 'test1234',
  });

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'testuser@example.com',
    password: 'test1234',
  });

  userToken = loginRes.body.data.token;

  // Create a game as admin (you can manually insert game data if needed)
  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin@example.com',
    password: 'admin123',
  });

  const adminToken = adminRes.body.data.token;

  const gameRes = await request(app)
    .post('/api/games')
    .set('Authorization', `Bearer ${adminToken}`)
    .field('title', 'Order Test Game')
    .field('description', 'Test Description')
    .field('platform', 'PC')
    .field('genre', 'Action')
    .field('price', 50)
    .field('stock', 5)
    .attach('cover', '__tests__/assets/test-cover.jpg');

  createdGameId = gameRes.body.data._id;

  // Add to cart
  await request(app)
    .post('/api/cart')
    .set('Authorization', `Bearer ${userToken}`)
    .send({ gameId: createdGameId, quantity: 1 });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Order API', () => {
  it('should place an order from the cart', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('should fetch order history for user', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should fetch order details by ID', async () => {
    const historyRes = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`);

    const orderId = historyRes.body.data[0]._id;

    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(orderId);
  });
});
