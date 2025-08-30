"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, ArrowLeft, Sparkles, Mail, Palette } from "lucide-react"
import Link from "next/link"

export default function DemoPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    recipientName: "",
    occasion: "",
    personalMessage: "",
    relationship: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const resetDemo = () => {
    setStep(1)
    setFormData({
      recipientName: "",
      occasion: "",
      personalMessage: "",
      relationship: "",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-yellow-600">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <img src="/new-logo-symbol.png" alt="Write Our Heart" className="h-8 w-8" />
              <span className="font-bold text-yellow-600">Write Our Heart Demo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Step {step} of 4</span>
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              Demo Mode
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900">
              {step === 1 && "Who are you sending a card to?"}
              {step === 2 && "What's the occasion?"}
              {step === 3 && "Share your heartfelt message"}
              {step === 4 && "Your beautiful card is ready!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient's Name</label>
                  <Input
                    placeholder="e.g., Mom, Sarah, Grandpa Joe"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange("recipientName", e.target.value)}
                    className="border-yellow-200 focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your relationship</label>
                  <Input
                    placeholder="e.g., daughter, son, friend, grandchild"
                    value={formData.relationship}
                    onChange={(e) => handleInputChange("relationship", e.target.value)}
                    className="border-yellow-200 focus:border-yellow-400"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What's the occasion?</label>
                  <Input
                    placeholder="e.g., Birthday, Anniversary, Just Because, Thank You"
                    value={formData.occasion}
                    onChange={(e) => handleInputChange("occasion", e.target.value)}
                    className="border-yellow-200 focus:border-yellow-400"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["Birthday", "Anniversary", "Thank You", "Just Because", "Get Well", "Congratulations"].map(
                    (occasion) => (
                      <Button
                        key={occasion}
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange("occasion", occasion)}
                        className="border-yellow-200 hover:bg-yellow-50 hover:border-yellow-400"
                      >
                        {occasion}
                      </Button>
                    ),
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your personal message (we'll make it beautiful!)
                  </label>
                  <Textarea
                    placeholder="Share what's in your heart... Our AI will help enhance your words while keeping your authentic voice."
                    value={formData.personalMessage}
                    onChange={(e) => handleInputChange("personalMessage", e.target.value)}
                    className="border-yellow-200 focus:border-yellow-400 min-h-32"
                  />
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">AI Enhancement Preview</h4>
                      <p className="text-sm text-yellow-700">
                        Our AI will take your heartfelt words and enhance them with beautiful language, poetry, and
                        formatting while keeping your authentic voice and sentiment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Card Created Successfully!</h3>
                  <p className="text-gray-600">Here's what would happen next in the real app:</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-blue-800 mb-1">AI Enhancement</h4>
                    <p className="text-sm text-blue-600">
                      Your message would be enhanced with beautiful poetry and formatting
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Palette className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium text-purple-800 mb-1">Beautiful Design</h4>
                    <p className="text-sm text-purple-600">
                      A stunning card design would be created to match your message
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-green-800 mb-1">Professional Mailing</h4>
                    <p className="text-sm text-green-600">
                      We'd print, address, stamp, and mail your card professionally
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-center">
                  <h4 className="text-xl font-bold text-white mb-2">Ready to create real cards?</h4>
                  <p className="text-white/90 mb-4">
                    Join our beta program and start sending heartfelt cards to your loved ones!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/auth">
                      <Button className="bg-white text-gray-900 hover:bg-gray-100">Start Your Beta Journey</Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={resetDemo}
                      className="border-white text-white hover:bg-white/10 bg-transparent"
                    >
                      Try Demo Again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {step < 4 && (
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                  className="border-yellow-200 hover:bg-yellow-50 bg-transparent"
                >
                  Previous
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={
                    (step === 1 && (!formData.recipientName || !formData.relationship)) ||
                    (step === 2 && !formData.occasion) ||
                    (step === 3 && !formData.personalMessage)
                  }
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                >
                  {step === 3 ? "Create Card" : "Next"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Info */}
        <div className="mt-8 text-center">
          <div className="bg-white/60 backdrop-blur-sm border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-gray-600">
              <strong>This is a demo.</strong> In the real app, your cards would be professionally printed on premium
              cardstock and mailed directly to recipients. Join our beta to start creating real cards!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
