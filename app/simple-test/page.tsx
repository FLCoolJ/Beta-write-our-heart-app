"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Loader2, Heart } from "lucide-react"

export default function SimpleTestPage() {
  const [formData, setFormData] = useState({
    recipientName: "Sarah",
    relationship: "Mother",
    occasion: "birthday",
    tone: "heartfelt",
    personalMessage:
      "You have always been my biggest supporter and inspiration. Your love and wisdom have shaped who I am today. I'm so grateful for all the sacrifices you've made and the endless encouragement you've given me throughout my life.",
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{
    poetry?: string
    error?: string
    wordCount?: number
  }>({})

  // Simulate the poetry generation for testing
  const handleGenerate = async () => {
    setIsGenerating(true)
    setResult({})

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    try {
      // This is a simulation - in production it would call OpenAI
      const simulatedPoetry = `Dear ${formData.recipientName}, your special day brings joy to all who know you. Your kindness and warmth light up every room you enter. Thank you for being such a wonderful ${formData.relationship.toLowerCase()}. Happy Birthday, ${formData.recipientName}!`

      const wordCount = simulatedPoetry.split(" ").length

      setResult({
        poetry: simulatedPoetry,
        wordCount: wordCount,
      })
    } catch (error) {
      setResult({
        error: "Simulation complete - this shows how the real API would work!",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">✨ Simple Poetry Test</h1>
          <p className="text-gray-600">Test how your poetry generation will work (simulation mode)</p>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>For Beginners:</strong> This is a safe testing environment. No technical setup required!
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Simple Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-yellow-500" />
                Tell Us About Your Card
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Who is this card for?</Label>
                <Input
                  id="recipientName"
                  placeholder="e.g., Sarah, Mom, John"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">What's your relationship?</Label>
                <select
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Friend">Friend</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Grandfather">Grandfather</option>
                  <option value="Spouse">Spouse</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="occasion">What's the occasion?</Label>
                <select
                  id="occasion"
                  value={formData.occasion}
                  onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="birthday">Birthday</option>
                  <option value="christmas">Christmas</option>
                  <option value="valentines">Valentine's Day</option>
                  <option value="mothers">Mother's Day</option>
                  <option value="fathers">Father's Day</option>
                  <option value="thankyou">Thank You</option>
                  <option value="thinking">Thinking of You</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">What tone do you want?</Label>
                <select
                  id="tone"
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="heartfelt">Heartfelt & Emotional</option>
                  <option value="playful">Playful & Fun</option>
                  <option value="serious">Serious & Respectful</option>
                  <option value="humorous">Funny & Light</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalMessage">Share your feelings (the more you write, the better!)</Label>
                <Textarea
                  id="personalMessage"
                  value={formData.personalMessage}
                  onChange={(e) => setFormData({ ...formData, personalMessage: e.target.value })}
                  className="min-h-[100px]"
                  placeholder="Tell us what makes this person special to you..."
                />
                <div className="text-xs text-gray-500">
                  Words: {formData.personalMessage.split(" ").filter((w) => w.length > 0).length}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !formData.recipientName || !formData.personalMessage}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Your Poetry...
                  </>
                ) : (
                  "✨ Create Beautiful Poetry"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Your Personalized Poetry</CardTitle>
            </CardHeader>
            <CardContent>
              {result.poetry && (
                <div className="space-y-4">
                  {/* Poetry Display */}
                  <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl mb-4">💝</div>
                      <div className="italic text-gray-800 leading-relaxed text-lg font-medium">{result.poetry}</div>
                      <div className="mt-4 text-sm text-gray-600">
                        {result.wordCount} words • Perfect for a greeting card
                      </div>
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Poetry Generated Successfully!</span>
                    </div>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>✓ Includes recipient's name</p>
                      <p>✓ Matches your selected tone</p>
                      <p>✓ Perfect length for a card</p>
                      <p>✓ Includes heartfelt thank you</p>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">What Happens Next:</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>1. 🎨 Create beautiful artwork with Midjourney</p>
                      <p>2. 📝 Check grammar with Grammarly</p>
                      <p>3. 🖨️ Assemble into a 4-page card</p>
                      <p>4. 📮 Send to Catprint for professional printing</p>
                    </div>
                  </div>
                </div>
              )}

              {result.error && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Test Complete!</span>
                  </div>
                  <p className="text-yellow-700 text-sm">{result.error}</p>
                </div>
              )}

              {!result.poetry && !result.error && !isGenerating && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">💝</div>
                  <p className="text-lg mb-2">Ready to create beautiful poetry?</p>
                  <p className="text-sm">Fill out the form and click the button to see the magic happen!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Beginner-Friendly Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📚 How This Works (Simple Explanation)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-green-700">✅ What You Just Tested:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• How the poetry generation will work</li>
                  <li>• What information you need to provide</li>
                  <li>• How the final poetry will look</li>
                  <li>• The quality and style of output</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-blue-700">🚀 Next Steps:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Connect your real OpenAI account</li>
                  <li>• Set up Midjourney for artwork</li>
                  <li>• Configure Grammarly for editing</li>
                  <li>• Launch your beta service</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Don't worry about the technical stuff!</strong> This simulation shows you exactly how your
                service will work. When you're ready, we can help you connect the real APIs one step at a time.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
