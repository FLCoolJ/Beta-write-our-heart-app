import { getAllUsers, type User } from "./auth-system"

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  plan: "legacy" | "whisper" | "none"
  freeCards: number
  usedCards: number
  heartsCount: number
  mailedCardsCount: number
  createdAt: string
}

export interface AdminMailedCard {
  id: string
  userId: string
  userEmail: string
  recipientName: string
  dateMailed: string
  occasion: string
}

export interface AdminStats {
  totalUsers: number
  totalCardsSent: number
  monthlyRevenue: number
}

export interface AdminActivity {
  user: string
  description: string
  timestamp: string
}

function convertToAdminUser(user: User): AdminUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    plan: user.plan || "none",
    freeCards: user.freeCards,
    usedCards: user.usedCards,
    heartsCount: user.hearts?.length || 0,
    mailedCardsCount: user.mailedCardsCount || 0,
    createdAt: user.createdAt,
  }
}

export const getAdminData = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const realUsers = getAllUsers()
  const totalUsers = realUsers.length
  const totalCardsSent = realUsers.reduce((sum, user) => sum + (user.mailedCardsCount || 0), 0)
  const revenue = realUsers.reduce((sum, user) => {
    const planRevenue = user.plan === "legacy" ? 19.99 : user.plan === "whisper" ? 9.99 : 0
    const additionalCards = Math.max(0, user.usedCards - user.freeCards)
    return sum + planRevenue + additionalCards * 4.99
  }, 0)

  const recentActivity = realUsers
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .map((user) => ({
      user: user.email,
      description: "New user signed up",
      timestamp: new Date(user.createdAt).toLocaleDateString(),
    }))

  return {
    totalUsers,
    totalCardsSent,
    revenue,
    recentActivity,
  }
}

export async function getAdminDashboardData(): Promise<{
  users: AdminUser[]
  mailedCards: AdminMailedCard[]
  stats: AdminStats
  activity: AdminActivity[]
}> {
  const realUsers = getAllUsers()
  const adminUsers = realUsers.map(convertToAdminUser)

  const totalUsers = adminUsers.length
  const totalCardsSent = adminUsers.reduce((sum, user) => sum + user.mailedCardsCount, 0)
  const monthlyRevenue = adminUsers.reduce((sum, user) => {
    // Calculate revenue based on plan and usage
    const planRevenue = user.plan === "legacy" ? 19.99 : user.plan === "whisper" ? 9.99 : 0
    const additionalCards = Math.max(0, user.usedCards - user.freeCards)
    return sum + planRevenue + additionalCards * 4.99
  }, 0)

  // Generate recent activity from real user data
  const recentActivity: AdminActivity[] = realUsers
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map((user) => ({
      user: user.email,
      description: "New user signed up",
      timestamp: new Date(user.createdAt).toLocaleDateString(),
    }))

  return {
    users: adminUsers,
    mailedCards: [], // Will be populated when card production is implemented
    stats: {
      totalUsers,
      totalCardsSent,
      monthlyRevenue,
    },
    activity: recentActivity,
  }
}
