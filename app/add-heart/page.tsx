"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Loader2, AlertCircle, CheckCircle, MicIcon, StopCircle } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

type Address = {
  address1: string
  address2: string
  city: string
  state: string
  zip5: string
  zip4: string
}

const OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Congratulations",
  "Thank You",
  "Get Well Soon",
  "Sympathy",
  "Holiday",
  "Just Because",
  "Mother's Day",
  "Father's Day",
  "Valentine's Day",
  "Christmas",
  "Other",
]

const TONE_OPTIONS = ["Serious", "Inspirational", "Playful", "Informal", "Heartfelt", "Humorous", "Persuasive"]

export default function AddHeartPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const isFirstHeart = searchParams.get("first") === "true"

  // Basic info
  const [name, setName] = useState("")
  const [relationship, setRelationship] = useState("")
  const [age, setAge] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState<Address>({
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip5: "",
    zip4: "",
  })

  // Address validation
  const [isAddressValidated, setIsAddressValidated] = useState(false)
  const [isValidationLoading, setIsValidationLoading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Occasions and dates
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([])
  const [occasionDates, setOccasionDates] = useState<{ [key: string]: Date }>({})
  const [customOccasion, setCustomOccasion] = useState("")
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null)

  // Tone and message
  const [selectedTone, setSelectedTone] = useState("")
  const [personalMessage, setPersonalMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)

  // Voice recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)

  // Form state
  const [currentStep, setCurrentStep] = useState(1) // 1: Basic Info, 2: Occasions, 3: Tone & Message
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get user data
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("currentUser") || "{}")
    if (userData && Object.keys(userData).length > 0) {
      setUser(userData)
    } else {
      router.push("/auth")
    }
  }, [router])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setPersonalMessage((prev) => prev + " " + finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsRecording(false)
        toast({
          title: "Voice Recognition Error",
          description: "There was an issue with voice recognition. Please try again.",
          variant: "destructive",
        })
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    }
  }, [toast])

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddress((prev) => ({ ...prev, [name]: value }))
    setIsAddressValidated(false)
    setValidationError(null)
  }

  const handleValidateAddress = async () => {
    setIsValidationLoading(true)
    setValidationError(null)
    try {
      const response = await fetch("/api/usps/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      })
      const data = await response.json()
      if (response.ok && data.validatedAddress) {
        setAddress(data.validatedAddress)
        setIsAddressValidated(true)
        toast({
          title: "Address Validated",
          description: "USPS has successfully validated the address.",
          variant: "default",
        })
      } else {
        setValidationError(data.error || "Invalid address. Please check and try again.")
        setIsAddressValidated(false)
      }
    } catch (error) {
      console.error("USPS validation error:", error)
      setValidationError("Could not connect to USPS. You can skip validation to continue.")
      setIsAddressValidated(false)
    } finally {
      setIsValidationLoading(false)
    }
  }

  const handleSkipValidation = () => {
    setIsAddressValidated(true)
    setValidationError(null)
    toast({
      title: "Validation Skipped",
      description: "Proceeding with the address as entered.",
      variant: "default",
    })
  }

  const handleOccasionChange = (occasion: string, checked: boolean) => {
    if (checked) {
      setSelectedOccasions((prev) => [...prev, occasion])
      // Show date picker for occasions that need dates
      if (["Wedding", "Other"].includes(occasion)) {
        setShowDatePicker(occasion)
      }
    } else {
      setSelectedOccasions((prev) => prev.filter((o) => o !== occasion))
      // Remove date if unchecked
      if (occasionDates[occasion]) {
        const newDates = { ...occasionDates }
        delete newDates[occasion]
        setOccasionDates(newDates)
      }
    }
  }

  const handleDateSelect = (occasion: string, date: Date | undefined) => {
    if (date) {
      setOccasionDates((prev) => ({ ...prev, [occasion]: date }))
      setShowDatePicker(null)
    }
  }

  const startVoiceRecording = async () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsRecording(true)
      recognitionRef.current.start()
      toast({
        title: "Recording Started",
        description: "Speak naturally - your words will appear in the text field.",
      })
    } catch (error) {
      console.error("Error starting voice recognition:", error)
      setIsRecording(false)
      toast({
        title: "Recording Error",
        description: "Could not start voice recording. Please try again.",
        variant: "destructive",
      })
    }
  }

  const stopVoiceRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
      toast({
        title: "Recording Stopped",
        description: "Voice recording has been stopped.",
      })
    }
  }

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length
  }

  const getMinWords = () => {
    return user?.userType === "legacy" ? 30 : 50
  }

  const isStep1Complete = () => {
    return (
      name &&
      relationship &&
      age &&
      email &&
      phone &&
      address.address1 &&
      address.city &&
      address.state &&
      address.zip5 &&
      isAddressValidated
    )
  }

  const isStep2Complete = () => {
    return (
      selectedOccasions.length > 0 &&
      selectedOccasions.every((occasion) => {
        if (["Wedding", "Other"].includes(occasion)) {
          return occasionDates[occasion] || (occasion === "Other" && customOccasion)
        }
        return true
      })
    )
  }

  const isStep3Complete = () => {
    return selectedTone && personalMessage && getWordCount(personalMessage) >= getMinWords()
  }

  const handleStep1Continue = () => {
    if (isStep1Complete()) {
      setCurrentStep(2)
    } else {
      toast({
        title: "Incomplete Information",
        description: "Please fill out all required fields and validate the address.",
        variant: "destructive",
      })
    }
  }

  const handleStep2Continue = () => {
    if (isStep2Complete()) {
      setCurrentStep(3)
    } else {
      toast({
        title: "Select Occasions",
        description: "Please select at least one occasion and provide dates where required.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    if (!isStep3Complete()) {
      toast({
        title: "Incomplete Form",
        description: `Please select a tone and write at least ${getMinWords()} words.`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const heartData = {
        id: Date.now().toString(),
        name,
        relationship,
        age,
        email,
        phone,
        address,
        occasions: selectedOccasions,
        occasionDates,
        customOccasion: customOccasion || undefined,
        tone: selectedTone,
        personalMessage,
        audioUrl,
        createdAt: new Date().toISOString(),
      }

      const currentUserStr = localStorage.getItem("currentUser")
      if (currentUserStr) {
        const userData = JSON.parse(currentUserStr)
        userData.hearts = [...(userData.hearts || []), heartData]
        localStorage.setItem("currentUser", JSON.stringify(userData))
        localStorage.setItem("user", JSON.stringify(userData))
      }

      // Show success message
      toast({
        title: "Heart Added Successfully! 🎉",
        description: "Your Heart has been saved. You can now schedule cards!",
      })

      // Redirect based on whether this is their first heart
      if (isFirstHeart) {
        // Show completion message for first heart
        setTimeout(() => {
          router.push("/add-heart/success")
        }, 1500)
      } else {
        router.push("/my-hearts")
      }
    } catch (error) {
      console.error("Error saving heart:", error)
      toast({
        title: "Save Failed",
        description: "An error occurred while saving your heart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{isFirstHeart ? "Create Your First Personalized Card" : "Add a New Heart"}</CardTitle>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? "bg-yellow-500 text-black" : "bg-gray-200"}`}
            >
              1
            </div>
            <div className={`h-1 w-8 ${currentStep >= 2 ? "bg-yellow-500" : "bg-gray-200"}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? "bg-yellow-500 text-black" : "bg-gray-200"}`}
            >
              2
            </div>
            <div className={`h-1 w-8 ${currentStep >= 3 ? "bg-yellow-500" : "bg-gray-200"}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 3 ? "bg-yellow-500 text-black" : "bg-gray-200"}`}
            >
              3
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Input
                    id="relationship"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">Mailing Address *</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address1">Address Line 1 *</Label>
                    <Input
                      id="address1"
                      name="address1"
                      value={address.address1}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                    <Input id="address2" name="address2" value={address.address2} onChange={handleAddressChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" name="city" value={address.city} onChange={handleAddressChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" name="state" value={address.state} onChange={handleAddressChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip5">ZIP Code *</Label>
                    <Input id="zip5" name="zip5" value={address.zip5} onChange={handleAddressChange} required />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    onClick={handleValidateAddress}
                    disabled={isValidationLoading || isAddressValidated}
                  >
                    {isValidationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isAddressValidated ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" /> Validated
                      </>
                    ) : (
                      "Validate Address with USPS"
                    )}
                  </Button>
                  {validationError && (
                    <Button type="button" onClick={handleSkipValidation} variant="secondary">
                      Skip Validation
                    </Button>
                  )}
                </div>
                {validationError && (
                  <p className="text-sm text-destructive flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" /> {validationError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Occasions */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Occasions</h3>
              <p className="text-sm text-gray-600">Choose the occasions you'd like to send cards for:</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {OCCASIONS.map((occasion) => (
                  <div key={occasion} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={occasion}
                        checked={selectedOccasions.includes(occasion)}
                        onCheckedChange={(checked) => handleOccasionChange(occasion, checked as boolean)}
                      />
                      <Label htmlFor={occasion} className="text-sm font-medium">
                        {occasion}
                      </Label>
                    </div>

                    {/* Show date picker for selected occasions that need dates */}
                    {selectedOccasions.includes(occasion) && ["Wedding", "Other"].includes(occasion) && (
                      <div className="ml-6 space-y-2">
                        {occasion === "Other" && (
                          <Input
                            placeholder="Enter custom occasion"
                            value={customOccasion}
                            onChange={(e) => setCustomOccasion(e.target.value)}
                            className="text-sm"
                          />
                        )}
                        <Popover
                          open={showDatePicker === occasion}
                          onOpenChange={(open) => setShowDatePicker(open ? occasion : null)}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal text-sm bg-transparent"
                            >
                              <CalendarIcon className="mr-2 h-3 w-3" />
                              {occasionDates[occasion] ? (
                                format(occasionDates[occasion], "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={occasionDates[occasion]}
                              onSelect={(date) => handleDateSelect(occasion, date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}

                    {/* Show selected date */}
                    {occasionDates[occasion] && (
                      <div className="ml-6 text-xs text-green-600">
                        ✓ {format(occasionDates[occasion], "MMM dd, yyyy")}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary of selected occasions */}
              {selectedOccasions.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">Selected Occasions ({selectedOccasions.length})</span>
                  </div>
                  <div className="space-y-1">
                    {selectedOccasions.map((occasion) => (
                      <div key={occasion} className="text-sm text-green-700">
                        • {occasion === "Other" ? customOccasion || "Other" : occasion}
                        {occasionDates[occasion] && ` - ${format(occasionDates[occasion], "MMM dd, yyyy")}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Tone and Message */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Personalize Your Message</h3>

              {/* Preferred Tone */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Preferred Tone *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TONE_OPTIONS.map((tone) => (
                    <div key={tone} className="flex items-center space-x-2">
                      <Checkbox
                        id={tone}
                        checked={selectedTone === tone}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedTone(tone)
                        }}
                      />
                      <Label htmlFor={tone} className="text-sm">
                        {tone}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedTone && <div className="text-sm text-green-600">✓ Selected: {selectedTone}</div>}
              </div>

              {/* Personal Message */}
              <div className="space-y-3">
                <Label htmlFor="personalMessage" className="text-base font-medium">
                  Personalize Message * (min {getMinWords()} words for{" "}
                  {user.userType === "legacy" ? "Legacy" : "Whisper"})
                </Label>

                <div className="space-y-3">
                  <Textarea
                    id="personalMessage"
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    rows={6}
                    placeholder="Share your heartfelt message here..."
                    required
                  />

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {getWordCount(personalMessage)} / {getMinWords()} words
                      {getWordCount(personalMessage) >= getMinWords() && (
                        <span className="text-green-600 ml-2">✓ Minimum reached</span>
                      )}
                    </p>

                    {/* Voice Recording Button */}
                    <div className="flex items-center gap-2">
                      {!isRecording ? (
                        <Button
                          type="button"
                          onClick={startVoiceRecording}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 bg-transparent"
                        >
                          <MicIcon className="w-4 h-4" />
                          Start Recording
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={stopVoiceRecording}
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <StopCircle className="w-4 h-4" />
                          Stop Recording
                        </Button>
                      )}
                    </div>
                  </div>

                  {isRecording && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-red-700">
                          Recording... Speak naturally and your words will appear above.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Voice Feature Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-800 mb-2">How Voice Recording Works:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>
                        1. <strong>Click "Start Recording"</strong> - Microphone activates
                      </li>
                      <li>
                        2. <strong>Speak naturally</strong> - Your words appear in the text field in real-time
                      </li>
                      <li>
                        3. <strong>Click "Stop Recording"</strong> - Saves the transcribed text
                      </li>
                      <li>
                        4. <strong>Edit if needed</strong> - You can still type to add or modify the message
                      </li>
                      <li>
                        5. <strong>Word count updates</strong> - Includes both typed and spoken words
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}

          <div className="flex gap-2 ml-auto">
            {currentStep === 1 && (
              <Button
                type="button"
                onClick={handleStep1Continue}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                disabled={!isStep1Complete()}
              >
                Continue
              </Button>
            )}

            {currentStep === 2 && (
              <>
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} className="bg-transparent">
                  Revise
                </Button>
                <Button
                  type="button"
                  onClick={handleStep2Continue}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  disabled={!isStep2Complete()}
                >
                  Continue
                </Button>
              </>
            )}

            {currentStep === 3 && (
              <>
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)} className="bg-transparent">
                  Revise
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  disabled={!isStep3Complete() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Add Heart"
                  )}
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
