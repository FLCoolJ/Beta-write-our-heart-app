import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface PoetryRequest {
  recipientName: string
  relationship: string
  occasion: string
  tone: string
  personalMessage: string
  wordCount?: number
}

export interface PoetryResponse {
  page2: string
  page3: string
  totalWords: number
  page2Words: number
  page3Words: number
}

export async function generatePoetry(request: PoetryRequest): Promise<PoetryResponse> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Anthropic API key not configured")
  }

  const firstName = request.recipientName.split(" ")[0]
  const minWords = request.wordCount || 80
  const maxWords = request.wordCount ? request.wordCount + 20 : 120

  const prompt = `Create a heartfelt 2-page greeting card message for ${firstName}.

REQUIREMENTS:
- Recipient: ${firstName} (${request.relationship})
- Occasion: ${request.occasion}
- Tone: ${request.tone}
- Personal context: "${request.personalMessage}"
- Total length: ${minWords}-${maxWords} words
- Format: Two distinct pages that flow together
- Use only the first name "${firstName}"

STRUCTURE:
Page 2 (Inside Left): Opening message that sets the emotional tone and acknowledges the occasion
Page 3 (Inside Right): Personal reflection incorporating their message, ending with warm closing

STYLE GUIDELINES:
- ${request.tone === "heartfelt" ? "Deeply emotional, sincere, touching" : "Warm but lighter, uplifting, joyful"}
- Natural, conversational flow
- Incorporate elements from their personal message
- Appropriate for ${request.occasion}
- Professional greeting card quality

Please provide ONLY the two pages of content, clearly marked as "PAGE 2:" and "PAGE 3:"`

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Anthropic")
    }

    const fullText = content.text

    // Parse the response to extract pages
    const page2Match = fullText.match(/PAGE 2:(.*?)(?=PAGE 3:|$)/s)
    const page3Match = fullText.match(/PAGE 3:(.*?)$/s)

    if (!page2Match || !page3Match) {
      throw new Error("Could not parse poetry response")
    }

    const page2 = page2Match[1].trim()
    const page3 = page3Match[1].trim()

    // Count words
    const page2Words = page2.split(/\s+/).filter((word) => word.length > 0).length
    const page3Words = page3.split(/\s+/).filter((word) => word.length > 0).length
    const totalWords = page2Words + page3Words

    return {
      page2,
      page3,
      totalWords,
      page2Words,
      page3Words,
    }
  } catch (error) {
    console.error("Anthropic API error:", error)
    throw new Error("Failed to generate poetry")
  }
}

export function createPoetryPrompt(
  occasion: string,
  recipientName: string,
  relationship: string,
  tone: string,
  personalMessage: string,
): string {
  const firstName = recipientName.split(" ")[0]

  const occasionContext = {
    birthday: "celebrating another year of their life and the joy they bring to others",
    christmas: "the warmth and love of the Christmas season",
    mothers: "honoring the incredible mother figure in your life",
    fathers: "celebrating the father figure who has meant so much",
    thankyou: "expressing deep gratitude for their kindness and support",
    anniversary: "celebrating your special relationship and shared memories",
    graduation: "celebrating their achievement and bright future ahead",
    sympathy: "offering comfort and support during a difficult time",
  }

  const context = occasionContext[occasion as keyof typeof occasionContext] || occasionContext.thankyou

  return `Write a beautiful, heartfelt greeting card message for ${firstName}, focusing on ${context}. 
  
  The tone should be ${tone}, and please incorporate this personal sentiment: "${personalMessage}"
  
  This is for my ${relationship.toLowerCase()}, so make it appropriate for that relationship.
  
  Create exactly 2 pages of content (80-120 words total) that would fit perfectly in a greeting card format.`
}
