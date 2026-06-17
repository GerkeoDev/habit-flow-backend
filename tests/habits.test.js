import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../server.js'

let cookies
let createdHabitId
const today = new Date().toISOString().split('T')[0]

const userData = {
  userName: 'habituser',
  email: 'habits@example.com',
  password: 'password123',
}

describe('Habits endpoints', () => {
  it('register and login for habit tests', async () => {
    await request(app).post('/api/register').send(userData)

    const loginRes = await request(app)
      .post('/api/login')
      .send({ email: userData.email, password: userData.password })

    cookies = loginRes.headers['set-cookie']
    expect(cookies).toBeDefined()
  })

  it('POST /api/habits - creates a new habit', async () => {
    const res = await request(app)
      .post('/api/habits')
      .set('Cookie', cookies)
      .query({ localDate: today })
      .send({ title: 'Test Habit', frequency: 'daily' })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Test Habit')
    expect(res.body.frequency).toBe('daily')
    expect(res.body.stats).toBeDefined()
    createdHabitId = res.body._id
  })

  it('POST /api/habits - rejects without auth', async () => {
    const res = await request(app)
      .post('/api/habits')
      .send({ title: 'No Auth Habit' })

    expect(res.status).toBe(401)
  })

  it('GET /api/habits - lists all habits', async () => {
    const res = await request(app)
      .get('/api/habits')
      .set('Cookie', cookies)
      .query({ localDate: today })

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(1)
  })

  it('GET /api/habits/:id - gets a single habit', async () => {
    const res = await request(app)
      .get(`/api/habits/${createdHabitId}`)
      .set('Cookie', cookies)
      .query({ localDate: today })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Test Habit')
    expect(res.body.stats).toBeDefined()
  })

  it('PUT /api/habits/:id - updates habit title', async () => {
    const res = await request(app)
      .put(`/api/habits/${createdHabitId}`)
      .set('Cookie', cookies)
      .query({ localDate: today })
      .send({ title: 'Updated Habit' })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Updated Habit')
  })

  it('PUT /api/habits/:id/check - checks habit for today', async () => {
    const res = await request(app)
      .put(`/api/habits/${createdHabitId}/check`)
      .set('Cookie', cookies)
      .send({ localDate: today })

    expect(res.status).toBe(200)
    expect(res.body.stats.completedToday).toBe(true)
    expect(res.body.completedDates).toContain(today)
  })

  it('PUT /api/habits/:id/check - unchecks habit', async () => {
    const res = await request(app)
      .put(`/api/habits/${createdHabitId}/check`)
      .set('Cookie', cookies)
      .send({ localDate: today })

    expect(res.status).toBe(200)
    expect(res.body.stats.completedToday).toBe(false)
    expect(res.body.completedDates).not.toContain(today)
  })

  it('DELETE /api/habits/:id - deletes habit', async () => {
    const res = await request(app)
      .delete(`/api/habits/${createdHabitId}`)
      .set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Habit deleted')
  })

  it('DELETE /api/habits/:id - returns 404 for deleted habit', async () => {
    const res = await request(app)
      .delete(`/api/habits/${createdHabitId}`)
      .set('Cookie', cookies)

    expect(res.status).toBe(404)
  })
})
