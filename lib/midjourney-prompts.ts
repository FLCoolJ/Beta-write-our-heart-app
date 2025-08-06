// Midjourney prompt generation system
export interface HeartData {
  name: string
  relationship: string
  occasions: string[]
  tone: string
  personalMessage: string
  otherOccasion?: string
}

export interface MidjourneyPrompt {
  occasion: string
  prompt: string
  recipient: string
}

const BASE_PROMPT = `Create a front cover for a 5x7 boutique-quality greeting card that looks artist-designed and emotionally rich, like a luxury Hallmark Signature or Papyrus card. The design should feel handmade and poetic, with layered textures, embossed-like effects, and warm, luxe lighting. Use soft, natural symbolism (like watercolor florals, elegant feathers, textured brush strokes, or gold foil leaves). The aesthetic should feel high-end, gift-worthy, and worthy of framing—something the recipient would keep. Avoid generic clipart or obvious digital filters. Use a creamy, matte background with artisan details. Use textured backgrounds: search "linen," "paper grain," "watercolor wash" Layer text with drop shadows or light bevels, Add gold foil textures or frame borders handwritten font that feels timeless (e.g., Playfair Display, Cormorant Garamond)`

const OCCASION_PROMPTS = {
  christmas:
    "Boutique-style 5x7 greeting card design, artist-painted Christmas scene with snowy pine trees, soft gold lighting, elegant wreath or candle, watercolor texture with luxe foil details, artisan aesthetic, Hallmark Signature style",

  valentines:
    "Romantic 5x7 greeting card cover with vintage roses, handwritten calligraphy heart, layered shadows and embossed effect, deep red and gold tones, poetic, luxury paper texture, boutique-style card like Papyrus",

  mothers:
    "Elegant 5x7 Mother's Day greeting card with soft watercolor florals (peonies, garden roses), warm pastel tones, gentle light, delicate gold foil details, emotional tone, hand-painted style, Papyrus quality",

  fathers:
    "Refined 5x7 greeting card design for Father's Day, abstract mountain or tree silhouette, muted blue and bronze tones, textured canvas background, vintage illustration style, heartfelt masculine tone, luxury card",

  graduation:
    "Graduation greeting card cover, golden laurel wreath, parchment scrolls, cap and tassel overlaid on textured paper, elegant black and gold palette, upscale and motivational design, Hallmark quality",

  easter:
    "Easter greeting card design, delicate spring blossoms, soft watercolor bunnies or eggs, pastel yellow and lavender tones, gentle lighting, luxurious matte texture with gold accents, boutique artisan style",

  stpatricks:
    "St. Patrick's Day card front, watercolor shamrocks, gold foil horseshoe, elegant Celtic knot border, deep emerald and soft gold palette, textured background with poetic minimalism, high-end greeting card",

  birthday:
    "Elegant birthday greeting card cover with hand-painted balloons, ribbons, golden sparkles, deep navy or blush tones, layered shadows and luxe paper feel, boutique artisan design",

  thankyou:
    "Thank you card design with gold script overlaid on textured paper, magnolia flower or subtle sunrise, minimalist luxury, embossed and artistic feel, poetic boutique design",

  thinking:
    "Thinking of You card, soft candlelight or window scene, watercolor brush textures in lavender and blue-gray, peaceful lighting, emotional calm, elegant boutique design with hand-drawn elements",

  newbaby:
    "New baby card design, soft animal (bunny or elephant), light pink or blue palette, star or moon accents, watercolor clouds, emotional and tender, luxury nursery feel, framed card style",

  getwell:
    "Get well card with watercolor cup of tea, warm blanket, sun through window, muted gold and cream tones, comforting, emotional, hand-illustrated design with luxury texture",

  sympathy:
    "Sympathy card design, falling petals or single flower in rain, gray-blue soft watercolor wash, poetic minimalism, calming tone, textured brush strokes, quiet elegance, Hallmark Signature quality",

  weddings:
    "Wedding greeting card cover, white roses, intertwined rings or hands, soft blush and champagne tones, romantic lighting and gold foil details, luxury artistic greeting card, Papyrus style",

  congratulations:
    "Congratulations card design with golden confetti, champagne splash, sleek black and gold or silver tones, layered embossed effect, celebration energy, boutique greeting card style",

  other:
    "Elegant 5x7 greeting card with artistic watercolor design, soft textures and warm lighting, boutique-quality aesthetic with handmade feel, luxury paper texture, timeless and emotional design",
}

export function generateMidjourneyPrompt(heartData: HeartData, occasion: string): MidjourneyPrompt {
  const occasionKey = occasion.toLowerCase().replace(/[^a-z]/g, "") as keyof typeof OCCASION_PROMPTS
  const occasionPrompt = OCCASION_PROMPTS[occasionKey] || OCCASION_PROMPTS.other

  // If it's "other" occasion, try to incorporate the custom occasion name
  let finalPrompt = occasionPrompt
  if (occasion === "other" && heartData.otherOccasion) {
    finalPrompt = `${heartData.otherOccasion} greeting card design, elegant 5x7 boutique-quality card with artistic watercolor design, soft textures and warm lighting, luxury paper texture, handmade aesthetic`
  }

  const fullPrompt = `${BASE_PROMPT}. ${finalPrompt} --v 6 --ar 5:7`

  return {
    occasion: occasion === "other" ? heartData.otherOccasion || "Special Occasion" : occasion,
    prompt: fullPrompt,
    recipient: heartData.name,
  }
}

export function generateAllPromptsForHeart(heartData: HeartData): MidjourneyPrompt[] {
  return heartData.occasions.map((occasion) => generateMidjourneyPrompt(heartData, occasion))
}

// Helper function to format prompt for Discord
export function formatForDiscord(prompt: MidjourneyPrompt): string {
  return `/imagine prompt: ${prompt.prompt}`
}

// Helper function to generate filename for organized storage
export function generateImageFilename(prompt: MidjourneyPrompt, heartData: HeartData): string {
  const safeName = heartData.name.replace(/[^a-zA-Z0-9]/g, "_")
  const safeOccasion = prompt.occasion.replace(/[^a-zA-Z0-9]/g, "_")
  const timestamp = new Date().toISOString().slice(0, 10)

  return `${safeName}_${safeOccasion}_${timestamp}.png`
}
