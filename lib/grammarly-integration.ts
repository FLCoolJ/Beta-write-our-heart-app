// Grammarly API integration
interface GrammarlyResponse {
  result: {
    corrected_text: string
    corrections: Array<{
      offset: number
      length: number
      replacement: string
      category: string
      description: string
    }>
  }
}

export async function checkGrammarWithGrammarly(text: string): Promise<{
  correctedText: string
  corrections: number
  suggestions: string[]
}> {
  const apiKey = process.env.GRAMMARLY_API_KEY

  if (!apiKey) {
    // Fallback to basic grammar checking
    return basicGrammarCheck(text)
  }

  try {
    const response = await fetch("https://api.grammarly.com/v1/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text: text,
        dialect: "american",
        domain: "creative",
      }),
    })

    if (!response.ok) {
      throw new Error(`Grammarly API error: ${response.status}`)
    }

    const data: GrammarlyResponse = await response.json()

    return {
      correctedText: data.result.corrected_text,
      corrections: data.result.corrections.length,
      suggestions: data.result.corrections.map((c) => c.description),
    }
  } catch (error) {
    console.error("Grammarly API error:", error)
    // Fallback to basic checking
    return basicGrammarCheck(text)
  }
}

// Basic grammar checking fallback
function basicGrammarCheck(text: string): {
  correctedText: string
  corrections: number
  suggestions: string[]
} {
  let correctedText = text
  const suggestions: string[] = []
  let corrections = 0

  // Basic corrections
  const basicFixes = [
    { pattern: /\s+/g, replacement: " ", description: "Fixed multiple spaces" },
    { pattern: /([.!?])\s*([a-z])/g, replacement: "$1 $2", description: "Fixed spacing after punctuation" },
    { pattern: /\s+([.!?])/g, replacement: "$1", description: "Removed space before punctuation" },
    { pattern: /([a-z])([A-Z])/g, replacement: "$1 $2", description: "Added space between words" },
  ]

  basicFixes.forEach((fix) => {
    const matches = correctedText.match(fix.pattern)
    if (matches) {
      correctedText = correctedText.replace(fix.pattern, fix.replacement)
      corrections += matches.length
      suggestions.push(fix.description)
    }
  })

  // Capitalize first letter
  correctedText = correctedText.charAt(0).toUpperCase() + correctedText.slice(1)

  return {
    correctedText: correctedText.trim(),
    corrections,
    suggestions,
  }
}
