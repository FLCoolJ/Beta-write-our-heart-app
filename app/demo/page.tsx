"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Heart, Sparkles, Send, Gift } from "lucide-react"
import Image from "next/image"

export default function DemoPage() {
  const [selectedStep, setSelectedStep] = useState(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/new-logo-symbol.png"
                alt="Write Our Heart Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Write Our Heart</h1>
                <p className="text-sm text-gray-600">Personalized Poetry Cards</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Demo Mode
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">See How Write Our Heart Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the magic of AI-powered personalized poetry cards. Create heartfelt messages for your loved ones
            in minutes.
          </p>
        </div>

        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="demo">Demo</TabsTrigger>
            <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
          </TabsList>

          <TabsContent value="demo" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1: Choose Occasion */}
              <Card
                className={`cursor-pointer transition-all ${selectedStep === 1 ? "ring-2 ring-pink-500 shadow-lg" : ""}`}
                onClick={() => setSelectedStep(1)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <CardTitle className="text-lg">Choose Occasion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Birthday
                    </Button>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Anniversary
                    </Button>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Thank You
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Add Personal Details */}
              <Card
                className={`cursor-pointer transition-all ${selectedStep === 2 ? "ring-2 ring-purple-500 shadow-lg" : ""}`}
                onClick={() => setSelectedStep(2)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Add Personal Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Recipient's name</p>
                    <p>• Your relationship</p>
                    <p>• Special memories</p>
                    <p>• Personal message</p>
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: AI Creates Poetry */}
              <Card
                className={`cursor-pointer transition-all ${selectedStep === 3 ? "ring-2 ring-blue-500 shadow-lg" : ""}`}
                onClick={() => setSelectedStep(3)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">AI Creates Poetry</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm italic text-gray-700">
                      "In moments shared and laughter bright,
                      <br />
                      Your friendship fills my heart with light..."
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Step 4: Send Your Card */}
              <Card
                className={`cursor-pointer transition-all ${selectedStep === 4 ? "ring-2 ring-green-500 shadow-lg" : ""}`}
                onClick={() => setSelectedStep(4)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Send className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Send Your Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      <Gift className="w-4 h-4 mr-2" />
                      Mail Physical Card
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Demo Preview */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Preview: Your Personalized Card</CardTitle>
                <CardDescription>This is what your AI-generated poetry card will look like</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 p-8 rounded-lg text-center">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Happy Birthday, Sarah!</h3>
                    <div className="text-gray-700 leading-relaxed">
                      <p className="italic mb-4">
                        "Another year of joy and grace,
                        <br />A smile that lights up every space.
                        <br />
                        Through seasons shared and memories made,
                        <br />
                        Our friendship's bond will never fade."
                      </p>
                      <p className="text-sm">
                        With love,
                        <br />
                        Your Friend
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="how-it-works" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-pink-600" />
                    Personal Touch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Share your memories, feelings, and special moments. Our AI uses these personal details to create
                    truly meaningful poetry.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                    AI Poetry Generation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Advanced AI crafts beautiful, personalized poems that capture your unique relationship and the
                    occasion you're celebrating.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Send className="w-5 h-5 mr-2 text-blue-600" />
                    Beautiful Delivery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Your personalized poetry card is professionally printed and mailed directly to your loved one's
                    doorstep.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ready to Create Your First Card?</CardTitle>
                <CardDescription>
                  Join thousands of people who have already sent heartfelt, personalized poetry cards to their loved
                  ones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button size="lg" className="w-full md:w-auto">
                  Start Creating Your Card
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
