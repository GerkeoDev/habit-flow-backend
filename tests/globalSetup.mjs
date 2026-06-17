import { MongoMemoryServer } from 'mongodb-memory-server'

export default async function globalSetup() {
  const mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()
  process.env.NODE_ENV = 'test'
  if (!process.env.CLIENT_URL) {
    process.env.CLIENT_URL = 'http://localhost:5173'
  }
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-secret-key'
  }
  return async () => {
    await mongod.stop()
  }
}
