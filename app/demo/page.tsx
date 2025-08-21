"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart } from "lucide-react"

export default function DemoPage() {
  const [step, setStep] = useState(1)
  const [demoData, setDemoData] = useState({
    recipientName: "Sarah Johnson",
    occasion: "Birthday",
    relationship: "Best Friend",
  })

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1)

      // Simulate AI generation
      setTimeout(() => {
        if (step === 1) setDemoData((prev) => ({ ...prev }))
        if (step === 2) setDemoData((prev) => ({ ...prev }))
        if (step === 3) setDemoData((prev) => ({ ...prev }))
      }, 2000)
    } else {
      setStep(1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md p-2">
              <img src="/logo.png" alt="Write Our Heart" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">Write Our Heart - Demo</h1>
              <p className="text-gray-600">Experience our AI-powered greeting card creation</p>
              <Badge className="bg-blue-500 text-white mt-1">Demo Mode for Canva Reviewers</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Demo: Creating a Birthday Card for {demoData.recipientName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Recipient Details:</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>
                    <strong>Name:</strong> {demoData.recipientName}
                  </li>
                  <li>
                    <strong>Occasion:</strong> {demoData.occasion}
                  </li>
                  <li>
                    <strong>Relationship:</strong> {demoData.relationship}
                  </li>
                  <li>
                    <strong>Address:</strong> 123 Demo St, Test City, CA 90210
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Demo */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((stepNum) => (
            <Card key={stepNum} className={`${step >= stepNum ? "border-yellow-500 bg-yellow-50" : "border-gray-200"}`}>
              <CardContent className="p-4 text-center">
                <div
                  className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    step >= stepNum ? "bg-yellow-500 text-white" : "bg-gray-200"
                  }`}
                >
                  {stepNum}
                </div>
                <h3 className="font-semibold text-sm mb-1">
                  {stepNum === 1 && "Generate Artwork"}
                  {stepNum === 2 && "Write Poetry"}
                  {stepNum === 3 && "Create Design"}
                  {stepNum === 4 && "Export Card"}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Step Display */}
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Experience Our Card Creation Process</h2>
          <p className="text-gray-600 mb-6">
            See how we transform your heartfelt message into a beautiful greeting card
          </p>
          <Button onClick={handleNextStep} className="bg-yellow-500 hover:bg-yellow-600 text-black">
            {step < 4 ? "Next Step" : "Start Over"}
          </Button>
        </div>
      </div>
    </div>
  )
}
