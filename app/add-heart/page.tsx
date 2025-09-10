"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Heart, ArrowLeft, CalendarIcon, Upload, Mic, MicOff, Edit, Clock, Trash2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import ProtectedRoute from "@/components/protected-route"

interface FormData {
  name: string
  relationship: string
  age: string
  email: string
  phone: string
  address: string
  occasions: { [key: string]: { selected: boolean; date?: string; customName?: string } }
  preferredTone: string
  personalizedMessage: string
  notes: string
}

const PREDEFINED_OCCASIONS = {
  "Mother's Day": { needsDate: false, fixedDate: "Second Sunday in May" },
  "Father's Day": { needsDate: false, fixedDate: "Third Sunday in June" },
  Birthday: { needsDate: true },
  Anniversary: { needsDate: true },
  Wedding: { needsDate: true },
  Graduation: { needsDate: true },
  Congratulations: { needsDate: true },
  "Get Well Soon": { needsDate: false },
  "Thank You": { needsDate: false },
  "Thinking of You": { needsDate: false },
}

const TONE_OPTIONS = ["Serious", "Inspirational", "Playful", "Informal", "Heartfelt", "Humorous", "Persuasive"]

function AddHeartContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [customOccasion, setCustomOccasion] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [showCsvUpload, setShowCsvUpload] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [currentStep, setCurrentStep] = useState(1) // 1: Form, 2: Occasions, 3: Message, 4: Complete

  const [formData, setFormData] = useState<FormData>({
    name: "",
    relationship: "",
    age: "",
    email: "",
    phone: "",
    address: "",
    occasions: {},
    preferredTone: "",
    personalizedMessage: "",
    notes: "",
  })

  useEffect(() => {
    const words = formData.personalizedMessage
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    setWordCount(words.length)
  }, [formData.personalizedMessage])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleOccasionToggle = (occasion: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      occasions: {
        ...prev.occasions,
        [occasion]: {
          ...prev.occasions[occasion],
          selected: checked,
          date: checked ? prev.occasions[occasion]?.date : undefined,
        },
      },
    }))
  }

  const handleDateSelect = (occasion: string, date: Date) => {
    setFormData((prev) => ({
      ...prev,
      occasions: {
        ...prev.occasions,
        [occasion]: {
          ...prev.occasions[occasion],
          selected: true,
          date: date.toISOString().split("T")[0],
        },
      },
    }))
    setShowCalendar(null)
  }

  const handleAddCustomOccasion = () => {
    if (customOccasion.trim()) {
      setFormData((prev) => ({
        ...prev,
        occasions: {
          ...prev.occasions,
          [customOccasion]: { selected: true, customName: customOccasion },
        },
      }))
      setCustomOccasion("")
      setShowCalendar(customOccasion)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/wav" })
        // Simulate speech-to-text conversion
        const simulatedText = "This is a simulated transcription of your voice message. "
        setFormData((prev) => ({
          ...prev,
          personalizedMessage: prev.personalizedMessage + simulatedText,
        }))
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      // Simulate CSV processing
      toast({
        title: "CSV Uploaded",
        description: "Processing your CSV file...",
      })
      setShowCsvUpload(false)
    }
  }

  const canProceedToStep2 = () => {
    return formData.name && formData.relationship && formData.email && formData.address
  }

  const canProceedToStep3 = () => {
    return Object.values(formData.occasions).some((occ) => occ.selected)
  }

  const canComplete = () => {
    const minWords = formData.preferredTone === "Legacy" ? 30 : 50
    return wordCount >= minWords && formData.preferredTone
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newHeart = {
        id: Date.now().toString(),
        ...formData,
        totalCardsSent: 0,
        createdAt: new Date().toISOString(),
      }

      const existingHearts = JSON.parse(localStorage.getItem("userHearts") || "[]")
      const updatedHearts = [...existingHearts, newHeart]
      localStorage.setItem("userHearts", JSON.stringify(updatedHearts))

      setCurrentStep(4)
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="e.g., Mom, Sarah, Grandpa Joe"
            required
          />
        </div>
        <div>
          <Label htmlFor="relationship">Relationship *</Label>
          <Input
            id="relationship"
            value={formData.relationship}
            onChange={(e) => handleInputChange("relationship", e.target.value)}
            placeholder="e.g., Mother, Friend, Colleague"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => handleInputChange("age", e.target.value)}
            placeholder="25"
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="email@example.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Mailing Address * (USPS Validated)</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="123 Main Street&#10;City, State 12345"
          className="min-h-20"
          required
        />
      </div>

      <div className="flex gap-4">
        <Button type="button" onClick={() => setShowCsvUpload(true)} variant="outline" className="flex-1">
          <Upload className="w-4 h-4 mr-2" />
          Upload CSV File
        </Button>
        <Button
          type="button"
          onClick={() => setCurrentStep(2)}
          disabled={!canProceedToStep2()}
          className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500"
        >
          Continue to Occasions
        </Button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        {Object.entries(PREDEFINED_OCCASIONS).map(([occasion, config]) => (
          <div key={occasion} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={formData.occasions[occasion]?.selected || false}
                onCheckedChange={(checked) => handleOccasionToggle(occasion, checked as boolean)}
              />
              <Label className="font-medium">{occasion}</Label>
              {config.fixedDate && <span className="text-sm text-gray-500">({config.fixedDate})</span>}
            </div>
            {config.needsDate && formData.occasions[occasion]?.selected && (
              <div className="flex items-center gap-2">
                {formData.occasions[occasion]?.date && (
                  <span className="text-sm text-green-600">
                    {new Date(formData.occasions[occasion].date!).toLocaleDateString()}
                  </span>
                )}
                <Dialog
                  open={showCalendar === occasion}
                  onOpenChange={(open) => setShowCalendar(open ? occasion : null)}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select Date for {occasion}</DialogTitle>
                    </DialogHeader>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && handleDateSelect(occasion, date)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <Label>Add Custom Occasion</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={customOccasion}
            onChange={(e) => setCustomOccasion(e.target.value)}
            placeholder="Type custom occasion..."
          />
          <Button onClick={handleAddCustomOccasion} variant="outline">
            Add
          </Button>
        </div>
      </div>

      {Object.values(formData.occasions).some((occ) => occ.selected) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Done</span>
          </div>
          <div className="text-sm text-green-700">
            Selected occasions:{" "}
            {Object.entries(formData.occasions)
              .filter(([_, occ]) => occ.selected)
              .map(([name]) => name)
              .join(", ")}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Button type="button" onClick={() => setCurrentStep(1)} variant="outline" className="flex-1">
          Back
        </Button>
        <Button
          type="button"
          onClick={() => setCurrentStep(3)}
          disabled={!canProceedToStep3()}
          className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500"
        >
          Continue to Message
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="tone">Preferred Tone *</Label>
        <Select value={formData.preferredTone} onValueChange={(value) => handleInputChange("preferredTone", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            {TONE_OPTIONS.map((tone) => (
              <SelectItem key={tone} value={tone}>
                {tone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="message">
          Personalized Message *
          <span className="text-sm text-gray-500">
            (Min {formData.preferredTone === "Legacy" ? "30" : "50"} words - Current: {wordCount})
          </span>
        </Label>
        <Textarea
          id="message"
          value={formData.personalizedMessage}
          onChange={(e) => handleInputChange("personalizedMessage", e.target.value)}
          placeholder="Write a heartfelt message..."
          className="min-h-32"
        />
        <div className="flex gap-2 mt-2">
          <Button type="button" onClick={isRecording ? stopRecording : startRecording} variant="outline" size="sm">
            {isRecording ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
            {isRecording ? "Stop Recording" : "Voice Recording"}
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="button" onClick={() => setCurrentStep(2)} variant="outline" className="flex-1">
          Back
        </Button>
        <Button
          type="submit"
          disabled={!canComplete() || isLoading}
          className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500"
        >
          {isLoading ? "Adding Heart..." : "Add Heart"}
        </Button>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h3>
        <p className="text-gray-600">Your Heart is added.</p>
      </div>

      <div className="flex gap-2 justify-center">
        <Button onClick={() => router.push("/my-hearts")} variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button onClick={() => router.push("/schedule-card")} variant="outline">
          <Clock className="w-4 h-4 mr-2" />
          Schedule Card
        </Button>
        <Button variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      <div className="text-xs text-gray-500">
        Need a non-scheduled card? Email corporate info@writeourheart.com with the reason and timing.
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => router.push("/dashboard")}
          className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500"
        >
          Connect to Dashboard
        </Button>
        <Button onClick={() => router.push("/my-hearts")} variant="outline" className="flex-1">
          Start Sending Cards
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/my-hearts" className="flex items-center gap-2 text-gray-600 hover:text-yellow-600">
              <ArrowLeft className="w-4 h-4" />
              Back to My Hearts
            </Link>
            <div className="flex items-center gap-2">
              <img src="/new-logo-symbol.png" alt="Write Our Heart" className="h-8 w-8" />
              <span className="font-bold text-yellow-600">Write Our Heart</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">
              {currentStep === 4 ? "Heart Added!" : "Add a New Heart"}
            </CardTitle>
            {currentStep < 4 && (
              <div className="flex justify-center gap-2 mt-4">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full ${step <= currentStep ? "bg-yellow-400" : "bg-gray-200"}`}
                  />
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* CSV Upload Modal */}
      <Dialog open={showCsvUpload} onOpenChange={setShowCsvUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload CSV File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload a CSV file with columns: Name, Relationship, Age, Email, Phone, Address
            </p>
            <Input type="file" accept=".csv" onChange={handleCsvUpload} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AddHeartPage() {
  return (
    <ProtectedRoute requiresSubscription={true}>
      <AddHeartContent />
    </ProtectedRoute>
  )
}
