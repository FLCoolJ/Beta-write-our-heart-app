import { type NextRequest, NextResponse } from "next/server"

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export async function POST(req: NextRequest) {
  try {
    const { tone, occasion, personalMessage, recipientName, relationship, otherOccasion } = await req.json()

    // Get API key from server environment
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured on server" }, { status: 500 })
    }

    const occasionName = occasion === "other" ? otherOccasion : occasion

    const prompt = `Create a heartfelt greeting card poem for ${recipientName} for ${occasionName}.

Context:
- Recipient: ${recipientName} (${relationship})
- Occasion: ${occasionName}
- Tone: ${tone}
- Personal message from sender: "${personalMessage}"

Requirements:
- Exactly 30-45 words
- Include "Thank you" and the recipient's name naturally
- Match the ${tone} tone
- Be emotionally appropriate for a ${relationship}
- End with a warm closing that includes their name
- Make it feel personal and heartfelt
- Suitable for handwritten cursive font
- Well-spaced for comfortable reading

Create beautiful, meaningful poetry that captures the sender's feelings and the special nature of this ${occasionName} occasion.

Return only the poem text, no additional formatting or explanation.`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a professional greeting card writer who creates beautiful, heartfelt poetry for special occasions. Your poems are always exactly 30-45 words and include the recipient's name and a thank you message.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: `OpenAI API error: ${response.status} - ${errorData.error?.message || "Unknown error"}` },
        { status: response.status },
      )
    }

    const data: OpenAIResponse = await response.json()
    const poetry = data.choices[0]?.message?.content?.trim()

    if (!poetry) {
      return NextResponse.json({ error: "No poetry generated from OpenAI" }, { status: 500 })
    }

    return NextResponse.json({ poetry })
  } catch (error) {
    console.error("Poetry generation error:", error)
    return NextResponse.json({ error: `Failed to generate poetry: ${error.message}` }, { status: 500 })
  }
}
