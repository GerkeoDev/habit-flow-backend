import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../server.js'

const userData = {
  userName: 'testuser',
  email: 'test@example.com',
  password: 'password123',
}

describe('Auth endpoints', () => {
  it('POST /api/register - registers a new user', async () => {
    const res = await request(app)
      .post('/api/register')
      .send(userData)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.user.email).toBe(userData.email)
    expect(res.body.user.userName).toBe(userData.userName)
  })

  it('POST /api/register - rejects duplicate email', async () => {
    const res = await request(app)
      .post('/api/register')
      .send(userData)

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('POST /api/register - validates missing fields', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ userName: 'ab', email: 'bad', password: 'short' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.errors).toBeDefined()
  })

  it('POST /api/login - logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: userData.email, password: userData.password })

    expect(res.status).toBe(200)
    expect(res.body.user.userName).toBe(userData.userName)
    expect(res.body.token).toBeDefined()
  })

  it('POST /api/login - rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: userData.email, password: 'wrongpassword' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('GET /api/me - returns user with valid token cookie', async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ email: userData.email, password: userData.password })

    const cookies = loginRes.headers['set-cookie']
    const res = await request(app)
      .get('/api/me')
      .set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body.userName).toBe(userData.userName)
  })

  it('GET /api/me - returns 401 without token', async () => {
    const res = await request(app).get('/api/me')

    expect(res.status).toBe(401)
  })

  it('POST /api/refresh - refreshes token', async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ email: userData.email, password: userData.password })

    const refreshToken = loginRes.body.refreshToken
    const res = await request(app)
      .post('/api/refresh')
      .send({ refreshToken })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.refreshToken).toBeDefined()
  })

  it('POST /api/logout - clears cookies', async () => {
    const loginRes = await request(app)
      .post('/api/login')
      .send({ email: userData.email, password: userData.password })

    const cookies = loginRes.headers['set-cookie']
    const res = await request(app)
      .post('/api/logout')
      .set('Cookie', cookies)

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Logout successful')
  })
})
