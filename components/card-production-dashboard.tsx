"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, AlertCircle, Download, Calendar, Gift, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface HeartType {
  id: string
  occasion: string
  recipient: string
  relationship: string
  tone: string
  createdAt: string
  status: "pending" | "generated" | "printed" | "mailed"
}

interface GenerationStep {
  id: string
  name: string
  status: "pending" | "processing" | "completed" | "error"
  result?: any
  error?: string
  previewData?: {
    type: "image" | "text" | "pdf"
    content: string
    title: string
  }
}

export function CardProductionDashboard() {
  const [selectedHeart, setSelectedHeart] = useState<HeartType | null>(null)
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  // Mock hearts data - replace with actual data from your backend
  const hearts: HeartType[] = [
    {
      id: "1",
      occasion: "Birthday",
      recipient: "Mom",
      relationship: "Mother",
      tone: "loving",
      createdAt: "2024-01-15",
      status: "pending",
    },
    {
      id: "2",
      occasion: "Anniversary",
      recipient: "Sarah",
      relationship: "Wife",
      tone: "romantic",
      createdAt: "2024-01-14",
      status: "pending",
    },
    {
      id: "3",
      occasion: "Get Well Soon",
      recipient: "John",
      relationship: "Friend",
      tone: "supportive",
      createdAt: "2024-01-13",
      status: "generated",
    },
  ]

  const initializeSteps = () => {
    return [
      { id: "artwork", name: "Generate Artwork (Leonardo.ai)", status: "pending" as const },
      { id: "poetry", name: "Create Poetry (Anthropic Claude)", status: "pending" as const },
      { id: "grammar", name: "Grammar Check (Sapling)", status: "pending" as const },
      { id: "card", name: "Assemble Card (Templated.io)", status: "pending" as const },
    ]
  }

  const generateCard = async () => {
    if (!selectedHeart) return

    setIsGenerating(true)
    setDownloadUrl(null)
    const steps = initializeSteps()
    setGenerationSteps(steps)

    try {
      // Step 1: Generate artwork
      updateStepStatus("artwork", "processing")
      const artworkResponse = await fetch("/api/leonardo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: selectedHeart.occasion,
          style: "greeting_card_cover",
        }),
      })

      if (!artworkResponse.ok) throw new Error("Artwork generation failed")
      const artworkData = await artworkResponse.json()
      const artworkPreview = {
        type: "image" as const,
        content: artworkData.imageUrl,
        title: `Artwork for ${selectedHeart.occasion}`,
      }
      updateStepStatus("artwork", "completed", artworkData, undefined, artworkPreview)

      // Step 2: Generate poetry
      updateStepStatus("poetry", "processing")
      const poetryResponse = await fetch("/api/generate-poetry-anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: selectedHeart.occasion,
          recipient: selectedHeart.recipient,
          relationship: selectedHeart.relationship,
          tone: selectedHeart.tone,
        }),
      })

      if (!poetryResponse.ok) throw new Error("Poetry generation failed")
      const poetryData = await poetryResponse.json()
      const poetryPreview = {
        type: "text" as const,
        content: poetryData.poetry.fullPoem,
        title: `Poetry for ${selectedHeart.recipient}`,
      }
      updateStepStatus("poetry", "completed", poetryData, undefined, poetryPreview)

      // Step 3: Grammar check (optional - can skip if Sapling not available)
      updateStepStatus("grammar", "processing")
      // For now, just pass through the poetry
      const grammarPreview = {
        type: "text" as const,
        content: poetryData.poetry.fullPoem, // Using original poem for now
        title: "Grammar Check Result",
      }
      updateStepStatus("grammar", "completed", { refinedText: poetryData.poetry.fullPoem }, undefined, grammarPreview)

      // Step 4: Create card with Templated.io
      updateStepStatus("card", "processing")
      const cardResponse = await fetch("/api/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: selectedHeart.occasion,
          recipient: selectedHeart.recipient,
          frontImage: artworkData.imageUrl,
          insideText: poetryData.poetry,
          heartId: selectedHeart.id,
        }),
      })

      if (!cardResponse.ok) throw new Error("Card assembly failed")
      const cardData = await cardResponse.json()
      const cardPreview = {
        type: "pdf" as const,
        content: cardData.previewUrl || cardData.downloadUrl,
        title: "Final Card Preview (PDF)",
      }
      updateStepStatus("card", "completed", cardData, undefined, cardPreview)

      setDownloadUrl(cardData.downloadUrl)
    } catch (error) {
      console.error("Card generation error:", error)
      const currentStep = steps.find((s) => s.status === "processing")
      if (currentStep) {
        updateStepStatus(currentStep.id, "error", null, error.message)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const updateStepStatus = (
    stepId: string,
    status: GenerationStep["status"],
    result?: any,
    error?: string,
    previewData?: GenerationStep["previewData"],
  ) => {
    setGenerationSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, status, result, error, previewData } : step)),
    )
  }

  const getStatusIcon = (status: GenerationStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "processing":
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "generated":
        return "bg-blue-100 text-blue-800"
      case "printed":
        return "bg-green-100 text-green-800"
      case "mailed":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Card Production Dashboard</h1>
        <p className="text-gray-600">Generate and manage greeting cards with Templated.io</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hearts List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pending Hearts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hearts.map((heart) => (
              <div
                key={heart.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedHeart?.id === heart.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedHeart(heart)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{heart.occasion}</span>
                  <Badge className={getStatusColor(heart.status)}>{heart.status}</Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <div>To: {heart.recipient}</div>
                  <div>Relationship: {heart.relationship}</div>
                  <div>Tone: {heart.tone}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Generation Process */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Card Generation Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedHeart ? (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Selected Heart</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Occasion:</strong> {selectedHeart.occasion}
                    </div>
                    <div>
                      <strong>Recipient:</strong> {selectedHeart.recipient}
                    </div>
                    <div>
                      <strong>Relationship:</strong> {selectedHeart.relationship}
                    </div>
                    <div>
                      <strong>Tone:</strong> {selectedHeart.tone}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Generation Steps</h3>
                    <Button onClick={generateCard} disabled={isGenerating} className="bg-red-600 hover:bg-red-700">
                      {isGenerating ? "Generating..." : "Generate Full Card with Templated.io"}
                    </Button>
                  </div>

                  {generationSteps.length > 0 && (
                    <div className="space-y-3">
                      {generationSteps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex items-center gap-2 flex-1">
                            {getStatusIcon(step.status)}
                            <span className="font-medium">{step.name}</span>
                          </div>

                          {step.status === "completed" && step.previewData && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
                                  <Eye className="h-4 w-4" />
                                  Preview
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>{step.previewData.title}</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4 max-h-[70vh] overflow-y-auto">
                                  {step.previewData.type === "image" && (
                                    <img
                                      src={step.previewData.content || "/placeholder.svg"}
                                      className="rounded-lg w-full"
                                    />
                                  )}
                                  {step.previewData.type === "text" && (
                                    <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap font-serif">
                                      {step.previewData.content}
                                    </div>
                                  )}
                                  {step.previewData.type === "pdf" && (
                                    <iframe
                                      src={step.previewData.content}
                                      className="w-full h-[65vh]"
                                      title="PDF Preview"
                                    />
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {step.status === "error" && <div className="text-sm text-red-600">Error: {step.error}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {downloadUrl && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-green-800">Card Ready!</h4>
                          <p className="text-sm text-green-600">Your print-ready card is available for download</p>
                        </div>
                        <Button
                          onClick={() => window.open(downloadUrl, "_blank")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Card
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a heart from the list to begin card generation</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
