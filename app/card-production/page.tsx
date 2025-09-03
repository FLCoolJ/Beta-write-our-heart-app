"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Palette, Send, Eye, Heart, Gift } from "lucide-react"
import { toast } from "sonner"

export default function CardProductionPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [selectedTemplate, setSelectedTemplate] = useState("classic")
  const [customMessage, setCustomMessage] = useState("")
  const [selectedOccasion, setSelectedOccasion] = useState("")
  const [recipientName, setRecipientName] = useState("")

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("currentUser") || "{}")
    if (userData && Object.keys(userData).length > 0) {
      if (!userData.emailVerified) {
        router.push("/auth")
        return
      }
      setUser(userData)
    } else {
      router.push("/auth")
    }
  }, [router])

  const templates = [
    {
      id: "classic",
      name: "Classic Elegance",
      description: "Timeless design with elegant typography",
      preview: "🎨 Classic border with beautiful script font",
    },
    {
      id: "modern",
      name: "Modern Minimalist",
      description: "Clean, contemporary design",
      preview: "✨ Simple lines with modern typography",
    },
    {
      id: "floral",
      name: "Floral Garden",
      description: "Beautiful botanical elements",
      preview: "🌸 Delicate flowers and nature motifs",
    },
    {
      id: "vintage",
      name: "Vintage Charm",
      description: "Nostalgic design with vintage flair",
      preview: "📜 Antique-inspired with ornate details",
    },
  ]

  const occasions = [
    { value: "birthday", label: "Birthday", icon: "🎂" },
    { value: "anniversary", label: "Anniversary", icon: "💕" },
    { value: "thank-you", label: "Thank You", icon: "🙏" },
    { value: "congratulations", label: "Congratulations", icon: "🎉" },
    { value: "get-well", label: "Get Well Soon", icon: "🌻" },
    { value: "sympathy", label: "Sympathy", icon: "🕊️" },
    { value: "holiday", label: "Holiday", icon: "🎄" },
    { value: "just-because", label: "Just Because", icon: "💝" },
  ]

  const handlePreviewCard = () => {
    const selectedTemplateData = templates.find((t) => t.id === selectedTemplate)
    const selectedOccasionData = occasions.find((o) => o.value === selectedOccasion)

    toast.info("Card Preview", {
      description: `Template: ${selectedTemplateData?.name}, Occasion: ${selectedOccasionData?.label || "Not selected"}, Recipient: ${recipientName || "Not specified"}`,
    })
  }

  const handleCreateCard = () => {
    if (!recipientName || !selectedOccasion || !customMessage) {
      toast.error("Please fill in all required fields before creating your card.")
      return
    }

    toast.success("Card Created!", {
      description: `Your personalized card for ${recipientName} is being prepared. You'll receive an email confirmation shortly.`,
    })

    // Reset form
    setRecipientName("")
    setCustomMessage("")
    setSelectedOccasion("")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/my-hearts")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <Palette className="w-8 h-8 text-yellow-500" />
              <div>
                <h1 className="text-2xl font-bold text-black">Card Production Studio</h1>
                <p className="text-gray-600">Create beautiful, personalized greeting cards</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Create Card
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Browse Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Your Personalized Card</CardTitle>
                <CardDescription>Design a beautiful greeting card with our easy-to-use tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recipient Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Recipient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient-name">Recipient Name *</Label>
                      <Input
                        id="recipient-name"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Enter recipient's name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="occasion">Occasion *</Label>
                      <Select value={selectedOccasion} onValueChange={setSelectedOccasion}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an occasion" />
                        </SelectTrigger>
                        <SelectContent>
                          {occasions.map((occasion) => (
                            <SelectItem key={occasion.value} value={occasion.value}>
                              <span className="flex items-center gap-2">
                                <span>{occasion.icon}</span>
                                {occasion.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Template Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Choose Template</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all ${
                          selectedTemplate === template.id ? "ring-2 ring-yellow-500 bg-yellow-50" : "hover:shadow-md"
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{template.name}</h4>
                            {selectedTemplate === template.id && (
                              <Badge className="bg-yellow-500 text-black">Selected</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                          <p className="text-xs text-gray-500">{template.preview}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Custom Message */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Your Message *</h3>
                  <div className="space-y-2">
                    <Label htmlFor="custom-message">Write your heartfelt message</Label>
                    <Textarea
                      id="custom-message"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Dear [Name], I wanted to take a moment to tell you..."
                      rows={6}
                      className="resize-none"
                    />
                    <p className="text-xs text-gray-500">{customMessage.length}/500 characters</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handlePreviewCard}
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Card
                  </Button>
                  <Button
                    onClick={handleCreateCard}
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    <Send className="w-4 h-4" />
                    Create & Send Card
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Gallery</CardTitle>
                <CardDescription>Browse our collection of beautiful card templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                          <div className="text-4xl">🎨</div>
                        </div>
                        <h4 className="font-medium mb-2">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => {
                            setSelectedTemplate(template.id)
                            // Switch to create tab
                            const createTab = document.querySelector('[value="create"]') as HTMLElement
                            createTab?.click()
                          }}
                        >
                          Use This Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User's Card Credits */}
        <Card className="mt-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Available Card Credits</p>
                  <p className="text-sm text-gray-600">
                    {user.freeCards || 0} free cards • {user.referralCards || 0} referral cards
                  </p>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                {(user.freeCards || 0) + (user.referralCards || 0)} Total
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
