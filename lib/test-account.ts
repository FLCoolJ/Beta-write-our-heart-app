// Test account configuration for Canva reviewers
export const TEST_ACCOUNT = {
  email: "canva-test@writeourheart.com",
  password: "CanvaTest2024!",
  firstName: "Canva",
  lastName: "Reviewer",
  userType: "legacy", // Full access for testing
  freeCards: 10, // Plenty for testing
  betaPricing: true,
  emailVerified: true,
  hearts: [
    {
      id: "test-heart-1",
      name: "Sarah Johnson",
      relationship: "Best Friend",
      email: "sarah@example.com",
      phone: "(555) 123-4567",
      address: "123 Demo Street",
      city: "Test City",
      state: "CA",
      zipCode: "90210",
      occasions: ["birthday", "anniversary"],
      occasionDates: {
        birthday: "2024-03-15",
        anniversary: "2024-06-20",
      },
      notes: "Loves flowers and poetry",
      createdAt: new Date().toISOString(),
    },
    {
      id: "test-heart-2",
      name: "John Smith",
      relationship: "Colleague",
      email: "john@example.com",
      address: "456 Test Avenue",
      city: "Demo Town",
      state: "NY",
      zipCode: "10001",
      occasions: ["thank you", "holiday"],
      occasionDates: {
        holiday: "2024-12-25",
      },
      notes: "Professional relationship",
      createdAt: new Date().toISOString(),
    },
  ],
}

export function createTestAccount() {
  // This would be called during app initialization to ensure test account exists
  const testUser = {
    ...TEST_ACCOUNT,
    id: "canva-test-user",
    createdAt: new Date().toISOString(),
    lastEmailVerification: new Date().toISOString(),
    cardAllocations: [
      {
        date: new Date().toISOString(),
        count: 7,
        month: new Date().toISOString().slice(0, 7),
      },
    ],
    lastCardAllocation: new Date().toISOString().slice(0, 7),
  }

  // Store in localStorage for demo purposes
  if (typeof window !== "undefined") {
    localStorage.setItem("canva-test-user", JSON.stringify(testUser))
  }

  return testUser
}
