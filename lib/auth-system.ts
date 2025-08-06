import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  passwordHash: string
  freeCards: number
  usedCards: number
  hearts: any[]
  createdAt: string
  subscriptionId?: string
  customerId?: string
  plan?: "whisper" | "legacy"
  emailVerified: boolean
  lastEmailVerification?: string
}

// In-memory storage for demo (replace with database in production)
const users: Map<string, User> = new Map()
const usersByEmail: Map<string, User> = new Map()

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export function generateJWT(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyJWT(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function createUser(userData: {
  email: string
  password: string
  firstName: string
  lastName: string
}): Promise<User> {
  const existingUser = usersByEmail.get(userData.email.toLowerCase())
  if (existingUser) {
    throw new Error("User already exists")
  }

  const passwordHash = await hashPassword(userData.password)
  const user: User = {
    id: uuidv4(),
    email: userData.email.toLowerCase(),
    firstName: userData.firstName,
    lastName: userData.lastName,
    passwordHash,
    freeCards: 2,
    usedCards: 0,
    hearts: [],
    createdAt: new Date().toISOString(),
    emailVerified: false,
  }

  users.set(user.id, user)
  usersByEmail.set(user.email, user)

  return user
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = usersByEmail.get(email.toLowerCase())
  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    return null
  }

  return user
}

export function getUserById(id: string): User | null {
  return users.get(id) || null
}

export function getUserByEmail(email: string): User | null {
  return usersByEmail.get(email.toLowerCase()) || null
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const user = users.get(id)
  if (!user) {
    return null
  }

  const updatedUser = { ...user, ...updates }
  users.set(id, updatedUser)
  usersByEmail.set(updatedUser.email, updatedUser)

  return updatedUser
}
