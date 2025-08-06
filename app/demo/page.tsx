"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Palette, FileText, Download, User, Lock } from "lucide-react"

export default function DemoPage() {
  const [step, setStep] = useState(1)
  const [demoData, setDemoData] = useState({
    recipientName: "Sarah Johnson",
    occasion: "Birthday",
    relationship: "Best Friend",
    generatedArtwork: false,
    generatedPoetry: false,
    createdCard: false,
  })

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1)

      // Simulate AI generation
      setTimeout(() => {
        if (step === 1) setDemoData((prev) => ({ ...prev, generatedArtwork: true }))
        if (step === 2) setDemoData((prev) => ({ ...prev, generatedPoetry: true }))
        if (step === 3) setDemoData((prev) => ({ ...prev, createdCard: true }))
      }, 2000)
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

      {/* Authentication Notice */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">Authentication Required</h3>
                <p className="text-sm text-blue-600">
                  This app requires user authentication for account management and Canva OAuth integration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
              <div>
                <h3 className="font-semibold mb-2">Integration Status:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${demoData.generatedArtwork ? "bg-green-500" : "bg-gray-300"}`}
                    ></div>
                    <span className="text-sm">Leonardo.ai Artwork</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${demoData.generatedPoetry ? "bg-green-500" : "bg-gray-300"}`}
                    ></div>
                    <span className="text-sm">OpenAI Poetry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${demoData.createdCard ? "bg-green-500" : "bg-gray-300"}`}
                    ></div>
                    <span className="text-sm">Canva Design</span>
                  </div>
                </div>
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
                <p className="text-xs text-gray-600">
                  {stepNum === 1 && "Leonardo.ai creates beautiful background"}
                  {stepNum === 2 && "OpenAI writes personalized message"}
                  {stepNum === 3 && "Canva assembles final design"}
                  {stepNum === 4 && "Download print-ready PDF"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Step Display */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {step === 1 && (
              <div className="text-center">
                <Palette className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Step 1: Generate Artwork</h2>
                <p className="text-gray-600 mb-4">Leonardo.ai is creating a beautiful birthday-themed background...</p>
                {demoData.generatedArtwork && (
                  <div className="bg-gradient-to-r from-pink-400 to-purple-500 h-32 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-white font-semibold">🎂 Beautiful Birthday Artwork Generated!</span>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="text-center">
                <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Step 2: Generate Poetry</h2>
                <p className="text-gray-600 mb-4">OpenAI is writing a personalized birthday message...</p>
                {demoData.generatedPoetry && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="italic text-gray-700">
                      "Another year of laughter, another year of joy,
                      <br />
                      Sarah, you're a treasure that nothing can destroy.
                      <br />
                      May your birthday sparkle with moments sweet and bright,
                      <br />
                      And fill your heart with happiness from morning until night."
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="text-center">
                <Palette className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Step 3: Create Design in Canva</h2>
                <p className="text-gray-600 mb-4">Canva is combining artwork and poetry into a professional card...</p>
                {demoData.createdCard && (
                  <div className="bg-gradient-to-r from-pink-400 to-purple-500 h-48 rounded-lg mb-4 flex items-center justify-center relative">
                    <div className="text-white text-center">
                      <div className="text-2xl mb-2">🎂</div>
                      <div className="text-sm italic mb-2">"Another year of laughter, another year of joy..."</div>
                      <div className="font-bold">Happy Birthday Sarah!</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="text-center">
                <Download className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Step 4: Export Complete!</h2>
                <p className="text-gray-600 mb-4">Your personalized greeting card is ready for printing!</p>
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <p className="text-green-800 font-semibold">✅ Card successfully created and exported as PDF</p>
                  <p className="text-sm text-green-600 mt-1">Ready for professional printing and mailing</p>
                </div>
              </div>
            )}

            <div className="text-center mt-6">
              {step < 4 ? (
                <Button onClick={handleNextStep} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  {step === 1 && "Generate Artwork"}
                  {step === 2 && "Write Poetry"}
                  {step === 3 && "Create in Canva"}
                </Button>
              ) : (
                <div className="space-x-4">
                  <Button onClick={() => setStep(1)} variant="outline">
                    Start Over
                  </Button>
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">Download PDF</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Authentication Details for Reviewers */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Authentication Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-blue-800">User Authentication</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Users create accounts to manage "Hearts" (recipients)</li>
                  <li>• Secure storage of personal recipient data</li>
                  <li>• Card history and preferences tracking</li>
                  <li>• Subscription and billing management</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-green-800">Canva OAuth Integration</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Users authorize app to create designs</li>
                  <li>• OAuth 2.0 secure authorization flow</li>
                  <li>• Programmatic design creation via API</li>
                  <li>• Export designs as print-ready PDFs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Credentials */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Test Credentials for Canva Reviewers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Demo Account</h3>
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm">
                    <strong>URL:</strong> https://beta.writeourheart.com
                  </p>
                  <p className="text-sm">
                    <strong>Email:</strong> canva-test@writeourheart.com
                  </p>
                  <p className="text-sm">
                    <strong>Password:</strong> CanvaTest2024!
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Test Instructions</h3>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Login with provided credentials</li>
                  <li>Navigate to "Card Production Dashboard"</li>
                  <li>Click "Connect to Canva" (requires approval)</li>
                  <li>Test complete card creation workflow</li>
                  <li>Verify design export functionality</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Details for Reviewers */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Details for Canva Reviewers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Leonardo.ai Integration</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Generates occasion-specific artwork</li>
                  <li>• High-quality backgrounds</li>
                  <li>• No text overlays (clean for Canva)</li>
                  <li>• API-driven automation</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">OpenAI Integration</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Personalized poetry generation</li>
                  <li>• Relationship-aware content</li>
                  <li>• Occasion-specific messaging</li>
                  <li>• Professional tone options</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Canva Integration</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Combines artwork + poetry</li>
                  <li>• Professional card layouts</li>
                  <li>• Print-ready PDF export</li>
                  <li>• Automated design assembly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
