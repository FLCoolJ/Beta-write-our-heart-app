"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, Eye, Sparkles, CheckCircle, Clock } from "lucide-react"
import { generateArtworkWithLeonardo, generateLeonardoPrompt } from "@/lib/leonardo-integration"
import { generatePoetryWithOpenAI } from "@/lib/openai-integration"
import {
  generateCardLayout,
  generateBatchForPrinting,
  generateBatchHTML,
  generateMailingCSV,
  downloadHTML,
  downloadCSV,
  printCardBatch,
  type CardLayoutData,
} from "@/lib/card-layout-generator"

interface HeartData {
  name: string
  relationship: string
  tone: string
  personalMessage: string
  occasions: string[]
  otherOccasion?: string
  address: string
  city: string
  state: string
  zipCode: string
}

interface SimpleCardGeneratorProps {
  heartData: HeartData
  occasion: string
}

export function SimpleCardGenerator({ heartData, occasion }: SimpleCardGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>("")
  const [results, setResults] = useState<{
    artworkUrl?: string
    poetry?: string
    cardHtml?: string
    cardData?: CardLayoutData
  }>({})

  const generateCompleteCard = async () => {
    setIsGenerating(true)

    try {
      // Step 1: Generate artwork with Leonardo
      setCurrentStep("Generating artwork with Leonardo.ai...")
      const leonardoPrompt = generateLeonardoPrompt(occasion, heartData.tone)
      const artworkUrl = await generateArtworkWithLeonardo(leonardoPrompt)
      setResults((prev) => ({ ...prev, artworkUrl }))

      // Step 2: Generate poetry with OpenAI
      setCurrentStep("Writing personalized poetry...")
      const poetry = await generatePoetryWithOpenAI(
        heartData.tone,
        occasion,
        heartData.personalMessage,
        heartData.name,
        heartData.relationship,
        heartData.otherOccasion,
      )
      setResults((prev) => ({ ...prev, poetry }))

      // Step 3: Create card layout
      setCurrentStep("Assembling print-ready card...")
      const cardData: CardLayoutData = {
        heartData: {
          name: heartData.name,
          relationship: heartData.relationship,
          address: heartData.address,
          city: heartData.city,
          state: heartData.state,
          zipCode: heartData.zipCode,
        },
        occasion: occasion === "other" ? heartData.otherOccasion || occasion : occasion,
        poetry,
        artworkUrl,
        cardId: `WOH_${Date.now()}_${heartData.name.replace(/\s+/g, "")}`,
      }

      const cardHtml = generateCardLayout(cardData)
      setResults((prev) => ({ ...prev, cardHtml, cardData }))

      setCurrentStep("Card ready for printing!")
    } catch (error) {
      console.error("Card generation error:", error)
      alert(`Error generating card: ${error.message}`)
    } finally {
      setIsGenerating(false)
      setCurrentStep("")
    }
  }

  const previewCard = () => {
    if (results.cardHtml) {
      const previewWindow = window.open("", "_blank")
      if (previewWindow) {
        previewWindow.document.write(results.cardHtml)
        previewWindow.document.close()
      }
    }
  }

  const downloadCard = () => {
    if (results.cardHtml && results.cardData) {
      const filename = `${results.cardData.heartData.name}_${results.cardData.occasion}_card.html`
      downloadHTML(results.cardHtml, filename)
    }
  }

  const printCard = async () => {
    if (results.cardHtml && results.cardData) {
      await printCardBatch(results.cardHtml, results.cardData.cardId)
    }
  }

  const createBatch = () => {
    if (results.cardData) {
      const batch = generateBatchForPrinting([results.cardData])
      const batchHtml = generateBatchHTML(batch)
      const mailingCsv = generateMailingCSV(batch)

      // Download batch files
      downloadHTML(batchHtml, `batch_${batch.batchId}.html`)
      downloadCSV(mailingCsv, `mailing_labels_${batch.batchId}.csv`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Simple Card Generator (No Canva Required)
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600 text-white">Leonardo.ai + OpenAI</Badge>
            <Badge variant="outline">Direct to Print</Badge>
            <Badge variant="outline">No Client Apps Needed</Badge>
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
              <strong>Address:</strong> {heartData.address}, {heartData.city}, {heartData.state} {heartData.zipCode}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Generation Process */}
      <Card>
        <CardHeader>
          <CardTitle>Card Generation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={generateCompleteCard}
            disabled={isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
          >
            {isGenerating ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                {currentStep}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Complete Card (Leonardo + OpenAI)
              </>
            )}
          </Button>

          {/* Results */}
          {results.artworkUrl && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Artwork generated successfully</span>
              </div>
              <img
                src={results.artworkUrl || "/placeholder.svg"}
                alt={`Generated ${occasion} card artwork in ${heartData.tone} style for ${heartData.name}`}
                className="w-full max-w-xs rounded-lg border"
              />
            </div>
          )}

          {results.poetry && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Poetry generated successfully</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="italic text-gray-800 leading-relaxed">{results.poetry}</p>
              </div>
            </div>
          )}

          {results.cardHtml && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Card assembled and ready for printing</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button onClick={previewCard} variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Card
                </Button>

                <Button
                  onClick={downloadCard}
                  variant="outline"
                  size="sm"
                  aria-label="Download card as HTML file for printing"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download HTML
                </Button>

                <Button
                  onClick={printCard}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                  aria-label="Print card directly from browser"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Card
                </Button>

                <Button
                  onClick={createBatch}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  size="sm"
                  aria-label="Create print batch with mailing labels for professional printing"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Create Print Batch
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Printing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Printing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">For Home Printing:</p>
              <p className="text-gray-600">• Use "Print Card" button</p>
              <p className="text-gray-600">• Select "Save as PDF"</p>
              <p className="text-gray-600">• Print on cardstock paper</p>
            </div>
            <div>
              <p className="font-medium">For Professional Printing:</p>
              <p className="text-gray-600">• Use "Create Print Batch"</p>
              <p className="text-gray-600">• Send HTML + CSV to printer</p>
              <p className="text-gray-600">• 5"x7" greeting card format</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
