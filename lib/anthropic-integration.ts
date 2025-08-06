export async function generatePoetryWithAnthropic(
  tone: string,
  occasion: string,
  personalMessage: string,
  recipientName: string,
  relationship: string,
  otherOccasion?: string,
): Promise<{ page2: string; page3: string; fullPoem: string }> {
  try {
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
        relationship,
        otherOccasion,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Poetry generation failed: ${response.status} - ${errorData.error || "Unknown error"}`)
    }

    const data = await response.json()

    if (!data.poetry) {
      throw new Error("No poetry generated")
    }

    return data.poetry
  } catch (error) {
    console.error("Poetry generation error:", error)
    throw new Error(`Failed to generate poetry: ${error.message}`)
  }
}
