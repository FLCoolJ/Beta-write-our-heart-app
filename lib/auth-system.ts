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
  referralCode?: string
  referredBy?: string
  mailedCardsCount?: number
  referralCards?: number
}

const STORAGE_KEY = "writeourheart_users"
const EMAIL_INDEX_KEY = "writeourheart_users_by_email"

function getUsers(): Map<string, User> {
  if (typeof window === "undefined") {
    // Server-side: use in-memory for API routes
    return globalThis.usersMap || (globalThis.usersMap = new Map())
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const userData = JSON.parse(stored)
      return new Map(Object.entries(userData))
    }
  } catch (error) {
    console.error("Error loading users from storage:", error)
  }
  return new Map()
}

function getUsersByEmail(): Map<string, User> {
  if (typeof window === "undefined") {
    return globalThis.usersByEmailMap || (globalThis.usersByEmailMap = new Map())
  }

  try {
    const stored = localStorage.getItem(EMAIL_INDEX_KEY)
    if (stored) {
      const userData = JSON.parse(stored)
      return new Map(Object.entries(userData))
    }
  } catch (error) {
    console.error("Error loading email index from storage:", error)
  }
  return new Map()
}

function saveUsers(users: Map<string, User>, usersByEmail: Map<string, User>) {
  if (typeof window === "undefined") {
    globalThis.usersMap = users
    globalThis.usersByEmailMap = usersByEmail
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(users)))
    localStorage.setItem(EMAIL_INDEX_KEY, JSON.stringify(Object.fromEntries(usersByEmail)))
  } catch (error) {
    console.error("Error saving users to storage:", error)
  }
}

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
  referralCode?: string
}): Promise<User> {
  const users = getUsers()
  const usersByEmail = getUsersByEmail()

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
    referralCode: uuidv4().substring(0, 8).toUpperCase(),
    referredBy: userData.referralCode,
    mailedCardsCount: 0,
    referralCards: 0,
  }

  users.set(user.id, user)
  usersByEmail.set(user.email, user)
  saveUsers(users, usersByEmail)

  return user
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const usersByEmail = getUsersByEmail()
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
  const users = getUsers()
  return users.get(id) || null
}

export function getUserByEmail(email: string): User | null {
  const usersByEmail = getUsersByEmail()
  return usersByEmail.get(email.toLowerCase()) || null
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getUsers()
  const usersByEmail = getUsersByEmail()

  const user = users.get(id)
  if (!user) {
    return null
  }

  const updatedUser = { ...user, ...updates }
  users.set(id, updatedUser)
  usersByEmail.set(updatedUser.email, updatedUser)
  saveUsers(users, usersByEmail)

  return updatedUser
}

export function getAllUsers(): User[] {
  const users = getUsers()
  return Array.from(users.values())
}

export function getUserByReferralCode(referralCode: string): User | null {
  const users = getUsers()
  for (const user of users.values()) {
    if (user.referralCode === referralCode) {
      return user
    }
  }
  return null
}

export function processReferralBonus(referrerCode: string, newUserEmail: string): { success: boolean; error?: string } {
  try {
    const users = getUsers()
    const usersByEmail = getUsersByEmail()

    // Find the referrer by their referral code
    const referrer = getUserByReferralCode(referrerCode)
    if (!referrer) {
      return { success: false, error: "Referrer not found" }
    }

    // Find the new user by email
    const newUser = usersByEmail.get(newUserEmail.toLowerCase())
    if (!newUser) {
      return { success: false, error: "New user not found" }
    }

    // Check if the new user was actually referred by this code
    if (newUser.referredBy !== referrerCode) {
      return { success: false, error: "Referral code mismatch" }
    }

    // Award bonuses: 2 cards to referrer, 2 cards to new user
    const updatedReferrer = {
      ...referrer,
      referralCards: (referrer.referralCards || 0) + 2,
    }

    const updatedNewUser = {
      ...newUser,
      referralCards: (newUser.referralCards || 0) + 2,
    }

    // Update both users in storage
    users.set(referrer.id, updatedReferrer)
    users.set(newUser.id, updatedNewUser)
    usersByEmail.set(referrer.email, updatedReferrer)
    usersByEmail.set(newUser.email, updatedNewUser)

    saveUsers(users, usersByEmail)

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export const registerUser = createUser

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// In-memory storage for verification codes (expires after 15 minutes)
const verificationCodes = new Map<string, { code: string; expires: number }>()

export function storeVerificationCode(email: string, code: string): void {
  const expires = Date.now() + 15 * 60 * 1000 // 15 minutes
  verificationCodes.set(email.toLowerCase(), { code, expires })
}

export function verifyVerificationCode(email: string, code: string): boolean {
  const stored = verificationCodes.get(email.toLowerCase())
  if (!stored) {
    return false
  }

  if (Date.now() > stored.expires) {
    verificationCodes.delete(email.toLowerCase())
    return false
  }

  if (stored.code === code) {
    verificationCodes.delete(email.toLowerCase())
    return true
  }

  return false
}

export function hasActiveSubscription(user: User): boolean {
  return !!(user.plan && user.subscriptionId)
}

export function setUserSubscription(
  userId: string,
  plan: "whisper" | "legacy",
  subscriptionId: string,
  customerId: string,
): User | null {
  const user = updateUser(userId, {
    plan,
    subscriptionId,
    customerId,
  })

  if (typeof window !== "undefined") {
    localStorage.setItem("hasSubscription", "true")
    localStorage.setItem("userPlan", plan)
  }

  return user
}

export function getCurrentUserSubscriptionStatus(): { hasSubscription: boolean; plan?: string } {
  if (typeof window === "undefined") {
    return { hasSubscription: false }
  }

  const hasSubscription = localStorage.getItem("hasSubscription") === "true"
  const plan = localStorage.getItem("userPlan") || undefined

  return { hasSubscription, plan }
}
