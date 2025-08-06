// In a real production application, this data would be fetched from a secure database.
// For demonstration purposes, we are using mock data to simulate a multi-user environment.

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  plan: "legacy" | "whisper"
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

const mockUsers: AdminUser[] = [
  {
    id: "user-1",
    firstName: "Alice",
    lastName: "Smith",
    email: "alice.smith@example.com",
    plan: "legacy",
    freeCards: 2,
    usedCards: 8,
    heartsCount: 5,
    mailedCardsCount: 8,
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "user-2",
    firstName: "Bob",
    lastName: "Johnson",
    email: "bob.j@example.com",
    plan: "whisper",
    freeCards: 1,
    usedCards: 1,
    heartsCount: 2,
    mailedCardsCount: 1,
    createdAt: "2024-02-20T14:30:00Z",
  },
  {
    id: "user-3",
    firstName: "Charlie",
    lastName: "Brown",
    email: "charlie.b@example.com",
    plan: "whisper",
    freeCards: 0,
    usedCards: 2,
    heartsCount: 3,
    mailedCardsCount: 2,
    createdAt: "2024-03-05T09:15:00Z",
  },
]

const mockMailedCards: AdminMailedCard[] = [
  {
    id: "card-1",
    userId: "user-1",
    userEmail: "alice.smith@example.com",
    recipientName: "Mom",
    dateMailed: "2024-03-15T11:00:00Z",
    occasion: "Birthday",
  },
  {
    id: "card-2",
    userId: "user-2",
    userEmail: "bob.j@example.com",
    recipientName: "John Doe",
    dateMailed: "2024-03-18T16:45:00Z",
    occasion: "Thank You",
  },
  {
    id: "card-3",
    userId: "user-1",
    userEmail: "alice.smith@example.com",
    recipientName: "Dad",
    dateMailed: "2024-03-20T12:00:00Z",
    occasion: "Father's Day",
  },
]

// This is a mock data source. In a real application, this would fetch data from your database.
export const getAdminData = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    totalUsers: 148,
    totalCardsSent: 312,
    revenue: 4520.50,
    recentActivity: [
      {
        user: "john.doe@example.com",
        description: "New user signed up",
        timestamp: "2 hours ago",
      },
      {
        user: "jane.smith@example.com",
        description: "Sent a 'Happy Birthday' card",
        timestamp: "3 hours ago",
      },
      {
        user: "sam.wilson@example.com",
        description: "Purchased 10 card credits",
        timestamp: "5 hours ago",
      },
      {
        user: "lisa.white@example.com",
        description: "New user signed up",
        timestamp: "1 day ago",
      },
    ],
  };
};

export async function getAdminDashboardData(): Promise<{
  users: AdminUser[]
  mailedCards: AdminMailedCard[]
  stats: AdminStats
  activity: AdminActivity[]
}> {
  // This function simulates a delay as if fetching from a remote database.
  await new Promise((resolve) => setTimeout(resolve, 500))

  const adminData = await getAdminData();

  return {
    users: mockUsers,
    mailedCards: mockMailedCards,
    stats: {
      totalUsers: adminData.totalUsers,
      totalCardsSent: adminData.totalCardsSent,
      monthlyRevenue: adminData.revenue,
    },
    activity: adminData.recentActivity,
  }
}
