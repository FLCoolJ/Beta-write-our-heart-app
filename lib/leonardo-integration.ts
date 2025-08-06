// Leonardo.ai API integration for high-quality artwork generation
interface LeonardoResponse {
  sdGenerationJob: {
    generationId: string
    status: string
  }
}

interface LeonardoImage {
  id: string
  url: string
  likeCount: number
  generated_image_variation_generics: any[]
}

export async function generateArtworkWithLeonardo(
  prompt: string,
  style: "LEONARDO_CREATIVE" | "LEONARDO_SELECT" | "LEONARDO_SIGNATURE" = "LEONARDO_CREATIVE",
): Promise<string> {
  const apiKey = process.env.LEONARDO_API_KEY

  if (!apiKey) {
    throw new Error("Leonardo API key not configured")
  }

  try {
    // Step 1: Create generation job
    const generateResponse = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        modelId: "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3", // Leonardo Creative model
        width: 1024,
        height: 1472, // 5:7 aspect ratio for greeting cards
        num_images: 1,
        guidance_scale: 7,
        num_inference_steps: 15,
        presetStyle: style,
        scheduler: "LEONARDO",
        public: false,
        promptMagic: true,
        photoReal: false,
        alchemy: true,
        photoRealVersion: "v2",
        contrastRatio: 0.9,
      }),
    })

    if (!generateResponse.ok) {
      throw new Error(`Leonardo generation failed: ${generateResponse.status}`)
    }

    const generateData: LeonardoResponse = await generateResponse.json()
    const generationId = generateData.sdGenerationJob.generationId

    // Step 2: Poll for completion
    let attempts = 0
    const maxAttempts = 30 // 5 minutes max wait

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 10000)) // Wait 10 seconds

      const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })

      if (!statusResponse.ok) {
        throw new Error(`Leonardo status check failed: ${statusResponse.status}`)
      }

      const statusData = await statusResponse.json()

      if (statusData.generations_by_pk?.status === "COMPLETE") {
        const images: LeonardoImage[] = statusData.generations_by_pk.generated_images
        if (images && images.length > 0) {
          return images[0].url
        }
      }

      attempts++
    }

    throw new Error("Leonardo generation timed out")
  } catch (error) {
    console.error("Leonardo API error:", error)
    throw new Error(`Failed to generate artwork with Leonardo: ${error.message}`)
  }
}

// Enhanced prompts for Leonardo.ai (no text, pure artwork)
export function generateLeonardoPrompt(occasion: string, tone: string): string {
  const basePrompt = "Beautiful greeting card artwork, no text, elegant design, high quality, professional, "

  const occasionPrompts = {
    birthday: "birthday celebration, balloons, confetti, warm colors, joyful atmosphere, party elements",
    christmas:
      "Christmas scene, winter wonderland, snow, pine trees, warm lighting, festive decorations, cozy atmosphere",
    valentines: "romantic roses, hearts, soft pink and red colors, elegant floral design, love theme",
    mothers: "beautiful flowers, garden scene, soft pastels, elegant botanical illustration, nurturing theme",
    fathers: "masculine design, nature scene, mountains or trees, strong colors, outdoor theme",
    thankyou: "gratitude theme, warm sunlight, peaceful scene, appreciation, gentle colors",
    thinking: "thoughtful scene, peaceful landscape, soft colors, contemplative mood",
    graduation: "achievement theme, academic elements, bright future, success, celebration",
    wedding: "romantic florals, elegant design, white and soft colors, love celebration",
    sympathy: "peaceful scene, gentle flowers, soft colors, comforting atmosphere",
    other: "elegant design, beautiful artwork, meaningful scene, appropriate colors",
  }

  const toneModifiers = {
    heartfelt: "emotional, touching, warm, sincere",
    playful: "fun, bright, cheerful, energetic",
    serious: "dignified, respectful, classic, formal",
    inspirational: "uplifting, motivating, bright, hopeful",
    humorous: "lighthearted, fun, bright, amusing",
    informal: "casual, relaxed, friendly, approachable",
  }

  const occasionPrompt = occasionPrompts[occasion as keyof typeof occasionPrompts] || occasionPrompts.other
  const tonePrompt = toneModifiers[tone as keyof typeof toneModifiers] || toneModifiers.heartfelt

  return `${basePrompt}${occasionPrompt}, ${tonePrompt}, 5x7 greeting card format, premium quality, artistic masterpiece`
}
