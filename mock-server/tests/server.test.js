const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { app, store } = require('../server');

// 於每次測試前複製一份資料長度，避免異動影響後續測試
let initialEventCount = 0;

beforeEach(() => {
  initialEventCount = store.events.length;
});

test('GET /events 應回傳含分頁欄位的事件列表', async () => {
  const response = await request(app).get('/events');
  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.items));
  assert.equal(response.body.page, 1);
  assert.equal(response.body.page_size, response.body.items.length);
  assert.equal(response.body.total, response.body.items.length);
  assert.equal(response.body.has_more, false);
  assert.ok(response.body.items.length >= 1);
});

test('POST /events 應建立新事件並支援 CRUD 流程', async () => {
  const payload = {
    event_key: 'INC-9999',
    summary: '測試事件',
    severity: 'warning',
    status: 'new'
  };

  const createResponse = await request(app).post('/events').send(payload);
  assert.equal(createResponse.status, 201);
  assert.ok(createResponse.body.id);
  const newId = createResponse.body.id;

  const detailResponse = await request(app).get(`/events/${newId}`);
  assert.equal(detailResponse.status, 200);
  assert.equal(detailResponse.body.summary, payload.summary);

  const updatedSummary = '測試事件 - 更新';
  const updateResponse = await request(app)
    .patch(`/events/${newId}`)
    .send({ summary: updatedSummary });
  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.body.summary, updatedSummary);

  const deleteResponse = await request(app).delete(`/events/${newId}`);
  assert.equal(deleteResponse.status, 204);
  assert.equal(store.events.length, initialEventCount);
});

test('GET /events/:id 異常請求應回傳 404', async () => {
  const response = await request(app).get('/events/non-exist-id');
  assert.equal(response.status, 404);
  assert.equal(response.body.code, 'NOT_FOUND');
});
