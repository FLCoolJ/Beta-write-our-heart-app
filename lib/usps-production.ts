export interface USPSValidationRequest {
  address: string
  city: string
  state: string
  zipCode: string
}

export interface USPSValidationResponse {
  success: boolean
  validatedAddress?: {
    streetAddress: string
    city: string
    state: string
    zipCode: string
  }
  originalAddress: {
    address: string
    city: string
    state: string
    zipCode: string
  }
  error?: string
}

export async function validateUSPSAddress(addressData: USPSValidationRequest): Promise<USPSValidationResponse> {
  const consumerKey = process.env.USPS_CONSUMER_KEY
  const consumerSecret = process.env.USPS_CONSUMER_SECRET

  if (!consumerKey || !consumerSecret) {
    throw new Error("USPS credentials not configured")
  }

  try {
    // Step 1: Get OAuth token
    const tokenResponse = await fetch("https://api.usps.com/oauth2/v3/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: consumerKey,
        client_secret: consumerSecret,
        scope: "addresses",
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error(`USPS authentication failed: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      throw new Error("Failed to get USPS access token")
    }

    // Step 2: Validate address
    const validationPayload = {
      streetAddress: addressData.address.trim(),
      city: addressData.city.trim(),
      state: addressData.state.trim(),
      ZIPCode: addressData.zipCode.trim(),
    }

    const validationResponse = await fetch("https://api.usps.com/addresses/v3/address", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(validationPayload),
    })

    if (!validationResponse.ok) {
      const errorText = await validationResponse.text()
      throw new Error(`USPS validation failed: ${validationResponse.status} - ${errorText}`)
    }

    const validationData = await validationResponse.json()

    return {
      success: true,
      validatedAddress: {
        streetAddress: validationData.streetAddress || addressData.address,
        city: validationData.city || addressData.city,
        state: validationData.state || addressData.state,
        zipCode: validationData.ZIPCode || addressData.zipCode,
      },
      originalAddress: addressData,
    }
  } catch (error) {
    console.error("USPS validation error:", error)
    return {
      success: false,
      originalAddress: addressData,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Add the missing validateAddress export that matches the expected interface
export async function validateAddress(address: {
  address1: string
  city: string
  state: string
  zipCode: string
}): Promise<{
  isValid: boolean
  validatedAddress?: {
    address1: string
    city: string
    state: string
    zipCode: string
  }
  error?: string
}> {
  try {
    const result = await validateUSPSAddress({
      address: address.address1,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    })

    if (result.success && result.validatedAddress) {
      return {
        isValid: true,
        validatedAddress: {
          address1: result.validatedAddress.streetAddress,
          city: result.validatedAddress.city,
          state: result.validatedAddress.state,
          zipCode: result.validatedAddress.zipCode,
        },
      }
    } else {
      return {
        isValid: false,
        error: result.error || "Address validation failed",
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
