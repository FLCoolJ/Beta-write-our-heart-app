"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Download, ExternalLink, CheckCircle, Clock, AlertTriangle, Sparkles, Eye } from "lucide-react"
import { generateLeonardoPrompt, generateArtworkWithLeonardo } from "@/lib/leonardo-integration"
import { createCardWithCanva, generateCanvaTemplateUrl } from "@/lib/canva-integration"
import { generatePoetryWithOpenAI } from "@/lib/openai-integration"

interface CardGenerationStep {
  id: string
  name: string
  status: "pending" | "in-progress" | "completed" | "error"
  data?: any
  description: string
}

interface HeartData {
  name: string
  relationship: string
  tone: string
  personalMessage: string
  occasions: string[]
  otherOccasion?: string
}

interface ProfessionalCardGeneratorProps {
  heartData: HeartData
  occasion: string
}

export function ProfessionalCardGenerator({ heartData, occasion }: ProfessionalCardGeneratorProps) {
  const [steps, setSteps] = useState<CardGenerationStep[]>([
    {
      id: "artwork",
      name: "Generate Artwork",
      status: "pending",
      description: "Create beautiful artwork with Leonardo.ai (no text)",
    },
    {
      id: "poetry",
      name: "Generate Poetry",
      status: "pending",
      description: "Create personalized poetry with OpenAI",
    },
    {
      id: "assembly",
      name: "Assemble Card",
      status: "pending",
      description: "Combine artwork and text using Canva API",
    },
    {
      id: "export",
      name: "Export Print-Ready",
      status: "pending",
      description: "Generate high-resolution PDF for printing",
    },
  ])

  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [results, setResults] = useState<{
    artworkUrl?: string
    poetry?: string
    canvaDesignId?: string
    canvaEditUrl?: string
    downloadUrl?: string
    leonardoPrompt?: string
  }>({})

  const updateStepStatus = (stepId: string, status: CardGenerationStep["status"], data?: any) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status, data } : step)))
  }

  const generateFullCard = async () => {
    setIsGenerating(true)

    try {
      // Step 1: Generate artwork with Leonardo.ai
      setCurrentStep("artwork")
      updateStepStatus("artwork", "in-progress")

      const leonardoPrompt = generateLeonardoPrompt(occasion, heartData.tone)
      setResults((prev) => ({ ...prev, leonardoPrompt }))

      const artworkUrl = await generateArtworkWithLeonardo(leonardoPrompt)
      setResults((prev) => ({ ...prev, artworkUrl }))
      updateStepStatus("artwork", "completed", { artworkUrl, prompt: leonardoPrompt })

      // Step 2: Generate poetry with OpenAI
      setCurrentStep("poetry")
      updateStepStatus("poetry", "in-progress")

      const poetry = await generatePoetryWithOpenAI(
        heartData.tone,
        occasion,
        heartData.personalMessage,
        heartData.name,
        heartData.relationship,
        heartData.otherOccasion,
      )
      setResults((prev) => ({ ...prev, poetry }))
      updateStepStatus("poetry", "completed", { poetry })

      // Step 3: Assemble card with Canva
      setCurrentStep("assembly")
      updateStepStatus("assembly", "in-progress")

      const canvaResult = await createCardWithCanva(artworkUrl, poetry, heartData.name, occasion)
      setResults((prev) => ({
        ...prev,
        canvaDesignId: canvaResult.designId,
        canvaEditUrl: canvaResult.editUrl,
        downloadUrl: canvaResult.downloadUrl,
      }))
      updateStepStatus("assembly", "completed", canvaResult)

      // Step 4: Export completed
      setCurrentStep("export")
      updateStepStatus("export", "completed", { ready: true })
    } catch (error) {
      console.error("Card generation error:", error)
      if (currentStep) {
        updateStepStatus(currentStep, "error", { error: error.message })
      }
    } finally {
      setIsGenerating(false)
      setCurrentStep(null)
    }
  }

  const getStatusIcon = (status: CardGenerationStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusColor = (status: CardGenerationStep["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-200"
      case "in-progress":
        return "bg-blue-50 border-blue-200"
      case "error":
        return "bg-red-50 border-red-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Professional Card Generator
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-600 text-white">Leonardo.ai + Canva API</Badge>
            <Badge variant="outline">100% Automated</Badge>
            <Badge variant="outline">Print-Ready</Badge>
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

      {/* Generation Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Process</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className={`p-4 border rounded-lg ${getStatusColor(step.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(step.status)}
                  <div>
                    <h3 className="font-semibold">{step.name}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Step {index + 1}
                </Badge>
              </div>

              {/* Step-specific content */}
              {step.id === "artwork" && step.data?.artworkUrl && (
                <div className="mt-3 space-y-2">
                  <img
                    src={step.data.artworkUrl || "/placeholder.svg"}
                    alt={`Generated artwork for ${occasion} card in ${heartData.tone} style`}
                    className="w-full max-w-xs rounded-lg border"
                  />
                  <p className="text-sm text-green-600">✓ High-quality artwork generated</p>
                  {step.data.prompt && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-600">View Leonardo prompt</summary>
                      <Textarea value={step.data.prompt} readOnly className="mt-2 text-xs" />
                    </details>
                  )}
                </div>
              )}

              {step.id === "poetry" && step.data?.poetry && (
                <div className="mt-3 p-3 bg-white border rounded">
                  <p className="text-sm font-medium mb-2">Generated Poetry:</p>
                  <p className="italic text-gray-800 text-sm leading-relaxed">{step.data.poetry}</p>
                </div>
              )}

              {step.id === "assembly" && step.data?.canvaEditUrl && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(step.data.canvaEditUrl, "_blank")}
                      variant="outline"
                      size="sm"
                      aria-label="Edit card design in Canva"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Edit in Canva
                    </Button>
                    <Button
                      onClick={() => window.open(step.data.canvaEditUrl, "_blank")}
                      variant="outline"
                      size="sm"
                      aria-label="Preview card design in Canva"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                  <p className="text-sm text-green-600">✓ Card assembled with perfect text placement</p>
                </div>
              )}

              {step.id === "export" && step.data?.ready && results.downloadUrl && (
                <div className="mt-3">
                  <Button
                    onClick={() => window.open(results.downloadUrl, "_blank")}
                    className="bg-green-600 hover:bg-green-700 text-white py-3"
                    aria-label="Download print-ready PDF file"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Print-Ready PDF
                  </Button>
                  <p className="text-sm text-green-600 mt-2">✓ Ready for professional printing</p>
                </div>
              )}

              {step.status === "error" && step.data?.error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">Error: {step.data.error}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={generateFullCard}
            disabled={isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
          >
            {isGenerating ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Generating Professional Card... ({currentStep})
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Professional Card (Leonardo + Canva)
              </>
            )}
          </Button>

          {!isGenerating && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Or use manual workflow:</p>
              <Button
                onClick={() => window.open(generateCanvaTemplateUrl(occasion), "_blank")}
                variant="outline"
                size="sm"
                aria-label="Open Canva template for manual card creation"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Canva Template
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Required API Keys</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="font-medium">Leonardo.ai</p>
              <p className="text-gray-600">$9/month • High-quality artwork</p>
            </div>
            <div>
              <p className="font-medium">OpenAI</p>
              <p className="text-gray-600">~$0.01/card • Poetry generation</p>
            </div>
            <div>
              <p className="font-medium">Canva API</p>
              <p className="text-gray-600">$12/month • Professional layouts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
