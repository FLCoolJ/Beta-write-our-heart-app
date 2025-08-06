"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Download, FileText, CheckCircle, AlertTriangle, Clock } from "lucide-react"

interface TemplatedCardGeneratorProps {
  heartData: any
  occasion: string
}

export function TemplatedCardGenerator({ heartData, occasion }: TemplatedCardGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [cardResult, setCardResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const generateCard = async () => {
    setIsGenerating(true)
    setError(null)
    setCardResult(null)

    try {
      const response = await fetch("/api/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion,
          recipient: {
            name: heartData.name,
            relationship: heartData.relationship,
          },
          customization: {
            tone: heartData.tone,
            personalMessage: heartData.personalMessage,
            otherOccasion: heartData.otherOccasion,
          },
          heartData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Card generation failed")
      }

      const result = await response.json()
      setCardResult(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Templated.io Card Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Card Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Card Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Recipient:</span> {heartData.name}
            </div>
            <div>
              <span className="font-medium">Occasion:</span> {occasion}
            </div>
            <div>
              <span className="font-medium">Relationship:</span> {heartData.relationship}
            </div>
            <div>
              <span className="font-medium">Tone:</span> {heartData.tone}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateCard}
          disabled={isGenerating}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Generating Card...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Generate Complete Card
            </>
          )}
        </Button>

        {/* Loading Steps */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 animate-spin text-blue-500" />
              <span>Generating Leonardo.ai artwork...</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 animate-spin text-blue-500" />
              <span>Creating Anthropic poetry...</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 animate-spin text-blue-500" />
              <span>Assembling with Templated.io...</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-semibold">Generation Failed</span>
            </div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Result */}
        {cardResult && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-4">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-semibold">Card Generated Successfully!</span>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Generated:</span>{" "}
                {new Date(cardResult.metadata.generatedAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Word Count:</span> {cardResult.metadata.wordCount}
              </div>
            </div>

            {/* Poetry Preview */}
            {cardResult.cardData.poetry && (
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium mb-2">Generated Poetry:</h4>
                <Textarea value={cardResult.cardData.poetry.page3} readOnly className="min-h-[100px] text-sm" />
              </div>
            )}

            {/* Download Button */}
            <Button
              onClick={() => window.open(cardResult.cardUrl, "_blank")}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Print-Ready Card
            </Button>

            {/* Specs */}
            <div className="text-xs text-gray-600 space-y-1">
              <p>✓ FedEx Print Ready (10" × 7")</p>
              <p>✓ 300 DPI High Resolution</p>
              <p>✓ Professional Card Layout</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
