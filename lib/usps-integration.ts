export interface USPSAddress {
  streetAddress: string
  city: string
  state: string
  zipCode: string
}

export interface USPSValidationResponse {
  isValid: boolean
  correctedAddress?: USPSAddress
  suggestions?: USPSAddress[]
  error?: string
}

export async function validateAddress(address: USPSAddress): Promise<USPSValidationResponse> {
  try {
    const response = await fetch("/api/usps/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(address),
    })

    if (!response.ok) {
      throw new Error(`USPS validation failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("USPS validation error:", error)
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Validation failed",
    }
  }
}

export function formatUSPSAddress(address: USPSAddress): string {
  return `${address.streetAddress}, ${address.city}, ${address.state} ${address.zipCode}`
}
