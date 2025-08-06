export interface LeonardoGenerationRequest {
  prompt: string
  modelId?: string
  width?: number
  height?: number
  numImages?: number
  guidanceScale?: number
  seed?: number
}

export interface LeonardoGenerationResponse {
  sdGenerationJob: {
    generationId: string
    apiCreditCost: number
  }
}

export interface LeonardoImage {
  id: string
  url: string
  likeCount: number
  nsfw: boolean
  generated_image_variation_generics: any[]
}

export interface LeonardoGenerationResult {
  generations_by_pk: {
    id: string
    status: string
    imageUrl?: string
    generated_images: LeonardoImage[]
    modelId: string
    prompt: string
    seed: number
    public: boolean
    createdAt: string
    promptMagic: boolean
    photoReal: boolean
    photoRealStrength: number
  }
}

const LEONARDO_API_BASE = "https://cloud.leonardo.ai/api/rest/v1"

export async function generateImage(request: LeonardoGenerationRequest): Promise<string> {
  const apiKey = process.env.LEONARDO_API_KEY

  if (!apiKey) {
    throw new Error("Leonardo API key not configured")
  }

  try {
    // Start generation
    const generateResponse = await fetch(`${LEONARDO_API_BASE}/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: request.prompt,
        modelId: request.modelId || "aa77f04e-3eec-4034-9c07-d0f619684628", // Leonardo Creative
        width: request.width || 512,
        height: request.height || 512,
        num_images: request.numImages || 1,
        guidance_scale: request.guidanceScale || 7,
        seed: request.seed,
        photoReal: true,
        photoRealStrength: 0.55,
        promptMagic: true,
      }),
    })

    if (!generateResponse.ok) {
      const error = await generateResponse.text()
      throw new Error(`Leonardo generation failed: ${error}`)
    }

    const generateResult: LeonardoGenerationResponse = await generateResponse.json()
    const generationId = generateResult.sdGenerationJob.generationId

    // Poll for completion
    let attempts = 0
    const maxAttempts = 30 // 5 minutes max

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 10000)) // Wait 10 seconds

      const statusResponse = await fetch(`${LEONARDO_API_BASE}/generations/${generationId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      if (!statusResponse.ok) {
        throw new Error("Failed to check generation status")
      }

      const statusResult: LeonardoGenerationResult = await statusResponse.json()

      if (statusResult.generations_by_pk.status === "COMPLETE") {
        const images = statusResult.generations_by_pk.generated_images
        if (images && images.length > 0) {
          return images[0].url
        }
        throw new Error("No images generated")
      }

      if (statusResult.generations_by_pk.status === "FAILED") {
        throw new Error("Image generation failed")
      }

      attempts++
    }

    throw new Error("Image generation timed out")
  } catch (error) {
    console.error("Leonardo API error:", error)
    throw error
  }
}

export function createOccasionPrompt(occasion: string, recipientName: string, relationship: string): string {
  const prompts = {
    birthday: `Beautiful birthday card cover art, elegant watercolor style, soft pastel colors, birthday cake with candles, balloons, confetti, warm and joyful atmosphere, professional greeting card design, high quality, artistic`,

    christmas: `Christmas greeting card cover art, winter wonderland scene, snow-covered pine trees, warm golden lights, cozy cabin in background, elegant typography space, traditional Christmas colors red and green with gold accents, professional greeting card design`,

    mothers: `Mother's Day card cover art, beautiful spring flowers, soft pink and lavender colors, elegant floral border, warm sunlight, peaceful garden setting, space for text, professional greeting card design, watercolor style`,

    fathers: `Father's Day card cover art, masculine design, outdoor nature scene, mountains or forest, earth tones, strong and peaceful atmosphere, space for text, professional greeting card design`,

    thankyou: `Thank you card cover art, elegant floral design, soft pastel colors, gratitude theme, beautiful typography space, warm and appreciative mood, professional greeting card design, watercolor style`,

    anniversary: `Anniversary card cover art, romantic design, soft roses, elegant gold accents, love theme, warm romantic colors, beautiful typography space, professional greeting card design`,

    graduation: `Graduation card cover art, celebratory design, cap and diploma, bright inspiring colors, achievement theme, professional greeting card design, space for text`,

    sympathy: `Sympathy card cover art, peaceful and comforting design, soft muted colors, gentle nature scene, serene and respectful mood, professional greeting card design, space for text`,
  }

  const basePrompt = prompts[occasion as keyof typeof prompts] || prompts.thankyou

  return `${basePrompt}, 4K resolution, professional printing quality, greeting card format`
}
