import { type NextRequest, NextResponse } from "next/server"

interface AnthropicResponse {
  content: Array<{
    text: string
  }>
}

export async function POST(req: NextRequest) {
  try {
    const { tone, occasion, personalMessage, recipientName, relationship, otherOccasion } = await req.json()

    // Get API key from server environment
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Anthropic API key not configured on server" }, { status: 500 })
    }

    const occasionName = occasion === "other" ? otherOccasion : occasion

    const prompt = `You are a professional poet creating personalized greeting card poetry. Create a heartfelt, meaningful poem for a 5x7 greeting card.

SPECIFICATIONS:
- Length: 150-250 words total
- Structure: The poem should be naturally divided into two parts
- Format: Design for splitting across two pages (page 2 and page 3 of greeting card)
- Style: Use a mix of rhyming and free verse as feels natural
- Line length: 4-8 words per line for optimal card readability
- Stanzas: 4-8 stanzas total, naturally grouped for page splitting

INPUT DETAILS:
- Occasion: ${occasionName}
- Recipient: ${recipientName}
- Relationship: ${relationship}
- Personal Message/Sentiment: ${personalMessage}
- Tone: ${tone}

FORMATTING REQUIREMENTS:
1. Create a natural break point around the middle for page splitting
2. Use "---PAGE BREAK---" to indicate where page 2 ends and page 3 begins
3. Ensure page 3 contains the emotional climax and conclusion
4. Use line breaks and stanza breaks for visual appeal
5. Make it deeply personal and specific to the relationship and occasion
6. Include "${recipientName}" naturally in the poem
7. Include "Thank you" sentiment naturally

TONE GUIDELINES:
- Heartfelt: Warm, sincere, emotionally resonant
- Humorous: Light-hearted, playful, with genuine affection
- Formal: Respectful, elegant, sophisticated
- Casual: Friendly, conversational, relaxed

Create a poem that captures the unique essence of this relationship and occasion. Make it feel like it was written specifically for ${recipientName} and this ${occasionName} situation.

Generate the complete poem now:`

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: `Anthropic API error: ${response.status} - ${errorData.error?.message || "Unknown error"}` },
        { status: response.status },
      )
    }

    const data: AnthropicResponse = await response.json()
    const poemText = data.content[0]?.text?.trim()

    if (!poemText) {
      return NextResponse.json({ error: "No poetry generated from Anthropic" }, { status: 500 })
    }

    // Format the poem for greeting card layout
    const formatForCard = (text: string) => {
      // Split at the page break marker
      const parts = text.split("---PAGE BREAK---")

      if (parts.length !== 2) {
        // If no page break found, split roughly in half
        const lines = text.split("\n").filter((line) => line.trim())
        const midPoint = Math.ceil(lines.length / 2)

        return {
          page2: lines.slice(0, midPoint).join("\n").trim(),
          page3: lines.slice(midPoint).join("\n").trim(),
          fullPoem: text.trim(),
        }
      }

      return {
        page2: parts[0].trim(),
        page3: parts[1].trim(),
        fullPoem: text.replace("---PAGE BREAK---", "").trim(),
      }
    }

    const formattedPoetry = formatForCard(poemText)

    return NextResponse.json({ poetry: formattedPoetry })
  } catch (error) {
    console.error("Poetry generation error:", error)
    return NextResponse.json({ error: `Failed to generate poetry: ${error.message}` }, { status: 500 })
  }
}
