import { jest } from '@jest/globals';
import request from 'supertest';
import app from './server.js'; 
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

jest.mock('./config/db.js', () => jest.fn(() => Promise.resolve()));

describe('Server Endpoints', () => {
  it('should return welcome message for the root route', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('<h1>Welcome to ecommerce app</h1>');
  });

  it('should handle 404 for unknown routes', async () => {
    const response = await request(app).get('/api/v1/unknown');
    expect(response.status).toBe(404);
  });
});
