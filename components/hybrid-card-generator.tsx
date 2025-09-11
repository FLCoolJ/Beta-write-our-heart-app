"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ExternalLink, CheckCircle, Clock, Copy, Sparkles } from "lucide-react"
import { generateLeonardoPrompt, generateArtworkWithLeonardo } from "@/lib/leonardo-integration"
import { generatePoetryWithOpenAI } from "@/lib/openai-integration"

interface HybridCardGeneratorProps {
  heartData: {
    name: string
    relationship: string
    tone: string
    personalMessage: string
    occasions: string[]
    otherOccasion?: string
  }
  occasion: string
}

export function HybridCardGenerator({ heartData, occasion }: HybridCardGeneratorProps) {
  const [step, setStep] = useState<"input" | "generating" | "ready">("input")
  const [results, setResults] = useState<{
    artworkUrl?: string
    poetry?: string
    leonardoPrompt?: string
    canvaUrl?: string
  }>({})

  const generateAssets = async () => {
    setStep("generating")

    try {
      // Generate Leonardo artwork
      const leonardoPrompt = generateLeonardoPrompt(occasion, heartData.tone)
      const artworkUrl = await generateArtworkWithLeonardo(leonardoPrompt)

      // Generate OpenAI poetry
      const poetry = await generatePoetryWithOpenAI(
        heartData.tone,
        occasion,
        heartData.personalMessage,
        heartData.name,
        heartData.relationship,
        heartData.otherOccasion,
      )

      // Generate Canva template URL
      const canvaUrl = `https://www.canva.com/design/create?type=GreetingCard_5x7&template=greeting-card`

      setResults({
        artworkUrl,
        poetry,
        leonardoPrompt,
        canvaUrl,
      })
      setStep("ready")
    } catch (error) {
      console.error("Generation error:", error)
      alert(`Error: ${error.message}`)
      setStep("input")
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    alert(`${label} copied to clipboard!`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Hybrid Card Generator
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white">Leonardo.ai + OpenAI</Badge>
            <Badge variant="outline">Manual Canva Assembly</Badge>
            <Badge variant="outline">100% Reliable</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Recipient:</strong> {heartData.name} ({heartData.relationship})
            </p>
            <p>
              <strong>Occasion:</strong> {occasion === "other" ? heartData.otherOccasion : occasion}
            </p>
            <p>
              <strong>Tone:</strong> {heartData.tone}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Generation Process */}
      {step === "input" && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Generate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This will generate high-quality artwork and personalized poetry. You'll then manually combine them in
              Canva for perfect control.
            </p>
            <Button onClick={generateAssets} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Artwork & Poetry
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "generating" && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Clock className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
              <h3 className="text-lg font-semibold">Generating Your Card Assets...</h3>
              <p className="text-gray-600">Creating artwork with Leonardo.ai and poetry with OpenAI</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "ready" && results.artworkUrl && results.poetry && (
        <div className="space-y-6">
          {/* Generated Artwork */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Generated Artwork
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <img
                src={results.artworkUrl || "/placeholder.svg"}
                alt={`Generated artwork for ${occasion} card with ${heartData.tone} tone`}
                className="w-full max-w-md mx-auto rounded-lg border shadow-lg"
              />
              <div className="flex gap-2">
                <Button onClick={() => window.open(results.artworkUrl, "_blank")} variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Size
                </Button>
                <Button onClick={() => copyToClipboard(results.artworkUrl!, "Artwork URL")} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
              </div>
              {results.leonardoPrompt && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-600 font-medium">View Leonardo Prompt</summary>
                  <Textarea value={results.leonardoPrompt} readOnly className="mt-2 text-xs" />
                </details>
              )}
            </CardContent>
          </Card>

          {/* Generated Poetry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Generated Poetry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 border rounded-lg">
                <p className="italic text-gray-800 leading-relaxed whitespace-pre-line">{results.poetry}</p>
              </div>
              <Button onClick={() => copyToClipboard(results.poetry!, "Poetry")} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy Poetry
              </Button>
            </CardContent>
          </Card>

          {/* Canva Assembly Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Assemble in Canva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold mb-2">Quick Assembly Steps:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Click "Open Canva Template" below</li>
                  <li>Upload your generated artwork as background</li>
                  <li>Add a text box and paste your poetry</li>
                  <li>Adjust font to "Cormorant Garamond" italic, 14pt</li>
                  <li>Center the text and adjust positioning</li>
                  <li>Download as high-resolution PDF</li>
                </ol>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(results.canvaUrl, "_blank")}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Canva Template
                </Button>
                <Button onClick={() => setStep("input")} variant="outline">
                  Generate Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
