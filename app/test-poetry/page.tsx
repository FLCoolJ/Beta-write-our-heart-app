"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generatePoetryWithAnthropic } from "@/lib/anthropic-integration"

export default function TestPoetryPage() {
  const [formData, setFormData] = useState({
    recipientName: "Sarah",
    relationship: "mother",
    occasion: "birthday",
    tone: "heartfelt",
    personalMessage: "Thank you for always being there for me and supporting my dreams",
    otherOccasion: "",
  })

  const [poetry, setPoetry] = useState<{ page2: string; page3: string; fullPoem: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setPoetry(null)

    try {
      const result = await generatePoetryWithAnthropic(
        formData.tone,
        formData.occasion,
        formData.personalMessage,
        formData.recipientName,
        formData.relationship,
        formData.otherOccasion,
      )
      setPoetry(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate poetry")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Anthropic Poetry Generation</h1>
          <p className="text-lg text-gray-600">Test the new Claude-powered poetry system for 2-page greeting cards</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Poetry Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  value={formData.recipientName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, recipientName: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="relationship">Relationship</Label>
                <Select
                  value={formData.relationship}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, relationship: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="occasion">Occasion</Label>
                <Select
                  value={formData.occasion}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, occasion: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">Birthday</SelectItem>
                    <SelectItem value="christmas">Christmas</SelectItem>
                    <SelectItem value="thankyou">Thank You</SelectItem>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                    <SelectItem value="graduation">Graduation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.occasion === "other" && (
                <div>
                  <Label htmlFor="otherOccasion">Custom Occasion</Label>
                  <Input
                    id="otherOccasion"
                    value={formData.otherOccasion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, otherOccasion: e.target.value }))}
                    placeholder="Enter custom occasion"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select
                  value={formData.tone}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, tone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="heartfelt">Heartfelt</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="personalMessage">Personal Message</Label>
                <Textarea
                  id="personalMessage"
                  value={formData.personalMessage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, personalMessage: e.target.value }))}
                  placeholder="Enter your personal message or sentiment"
                  rows={3}
                />
              </div>

              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading ? "Generating Poetry..." : "Generate Poetry with Claude"}
              </Button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Poetry Output */}
          <div className="space-y-6">
            {poetry && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Page 2 (Inside Left)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white p-6 rounded-lg border-2 border-gray-200 min-h-[300px] font-serif text-lg leading-relaxed">
                      {poetry.page2.split("\n").map((line, index) => (
                        <div key={index} className={line.trim() === "" ? "h-4" : ""}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Page 3 (Inside Right)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white p-6 rounded-lg border-2 border-gray-200 min-h-[300px] font-serif text-lg leading-relaxed">
                      {poetry.page3.split("\n").map((line, index) => (
                        <div key={index} className={line.trim() === "" ? "h-4" : ""}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Full Poem Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <strong>Word Count:</strong> {poetry.fullPoem.split(" ").length} words
                      </p>
                      <p>
                        <strong>Target Range:</strong> 150-250 words
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <span
                          className={
                            poetry.fullPoem.split(" ").length >= 150 && poetry.fullPoem.split(" ").length <= 250
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {poetry.fullPoem.split(" ").length >= 150 && poetry.fullPoem.split(" ").length <= 250
                            ? " ✅ Perfect length"
                            : " ⚠️ Needs adjustment"}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
