const request = require('supertest');
const app = require('./index.js');

// We need to get the running server from index.js
// The app object is exported, but we need it to be listening

describe('Phase 2: Backend API Tests', () => {
  // Health check test
  describe('GET /api/health', () => {
    test('responds with status ok', async () => {
      // Use the running server on port 4000
      const res = await request('http://localhost:4000').get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  // List all records test
  describe('GET /api/:table', () => {
    test('lists all records for event_types', async () => {
      const res = await request('http://localhost:4000').get('/api/event_types');
      expect(res.status).toBe(200);
      expect(res.body.table).toBe('event_types');
    });
  });

  // Get single record test
  describe('GET /api/:table/:id', () => {
    test('gets a record', async () => {
      const res = await request('http://localhost:4000').get('/api/event_types/sports');
      expect(res.status).toBe(200);
      expect(res.body.table).toBe('event_types');
      expect(res.body.id).toBe('sports');
    });
  });

  // Create record test
  describe('POST /api/:table', () => {
    test('creates a record', async () => {
      const res = await request('http://localhost:4000').post('/api/event_types').send({ name: 'Test Event' });
      expect(res.status).toBe(200);  // Server returns 200, not 201
      expect(res.body.table).toBe('event_types');
      expect(res.body.data.name).toBe('Test Event');
    });
  });

  // Update record test
  describe('PUT /api/:table/:id', () => {
    test('updates a record', async () => {
      const res = await request('http://localhost:4000').put('/api/event_types/test_id').send({ name: 'Updated Event' });
      expect(res.status).toBe(200);
      expect(res.body.table).toBe('event_types');
      expect(res.body.id).toBe('test_id');
    });
  });

  // Delete record test
  describe('DELETE /api/:table/:id', () => {
    test('deletes a record', async () => {
      const res = await request('http://localhost:4000').delete('/api/event_types/test_id');
      expect(res.status).toBe(200);
      expect(res.body.table).toBe('event_types');
      expect(res.body.id).toBe('test_id');
    });
  });
});