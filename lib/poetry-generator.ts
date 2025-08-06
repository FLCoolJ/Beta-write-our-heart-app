// Updated poetry generation system using Anthropic Claude
interface HeartData {
  relationship: string
  otherOccasion?: string
}

export interface PoetryRequest {
  heartData: HeartData
  occasion: string
  tone: string
  personalMessage: string
  recipientName: string
}

export interface PoetryResponse {
  poetry: {
    page2: string
    page3: string
    fullPoem: string
  }
  wordCount: number
  occasion: string
  recipientName: string
}

export async function generatePoetry(request: PoetryRequest): Promise<PoetryResponse> {
  const { heartData, occasion, tone, personalMessage, recipientName } = request

  try {
    // Call Anthropic API instead of OpenAI
    const response = await fetch("/api/generate-poetry-anthropic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tone,
        occasion,
        personalMessage,
        recipientName,
        relationship: heartData.relationship,
        otherOccasion: heartData.otherOccasion,
      }),
    })

    if (!response.ok) {
      throw new Error(`Poetry generation failed: ${response.status}`)
    }

    const data = await response.json()

    return {
      poetry: data.poetry,
      wordCount: data.poetry.fullPoem.split(" ").length,
      occasion: occasion === "other" ? heartData.otherOccasion || "Special Occasion" : occasion,
      recipientName,
    }
  } catch (error) {
    console.error("Error generating poetry:", error)
    throw new Error("Failed to generate poetry")
  }
}

// Grammar check simulation (would integrate with Grammarly API)
export async function checkGrammar(text: string): Promise<string> {
  // Simulate grammar checking
  // In production, this would call Grammarly API
  console.log("Checking grammar for:", text)

  // Simple corrections simulation
  const correctedText = text
    .replace(/\s+/g, " ") // Fix multiple spaces
    .replace(/([.!?])\s*([a-z])/g, "$1 $2") // Fix spacing after punctuation
    .trim()

  return correctedText
}

// Validate poetry meets requirements
export function validatePoetry(poetry: { fullPoem: string }): { isValid: boolean; issues: string[] } {
  const issues: string[] = []
  const wordCount = poetry.fullPoem.split(" ").filter((word) => word.length > 0).length

  if (wordCount < 150) {
    issues.push(`Poetry is too short (${wordCount} words, minimum 150)`)
  }

  if (wordCount > 250) {
    issues.push(`Poetry is too long (${wordCount} words, maximum 250)`)
  }

  if (!poetry.fullPoem.toLowerCase().includes("thank you")) {
    issues.push('Poetry must include "Thank you"')
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}
