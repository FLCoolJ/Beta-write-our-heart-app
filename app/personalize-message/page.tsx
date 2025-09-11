"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, ArrowLeft } from "lucide-react"

const tones = [
  { id: "serious", label: "Serious", description: "Formal and respectful" },
  { id: "inspirational", label: "Inspirational", description: "Uplifting and motivating" },
  { id: "heartfelt", label: "Heartfelt", description: "Emotional and sincere" },
  { id: "playful", label: "Playful", description: "Fun and lighthearted" },
  { id: "informal", label: "Informal", description: "Casual and relaxed" },
  { id: "humorous", label: "Humorous", description: "Funny and entertaining" },
  { id: "persuasive", label: "Persuasive", description: "Convincing and compelling" },
]

export default function PersonalizeMessage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const heartId = searchParams.get("heartId")

  const [selectedTone, setSelectedTone] = useState("")
  const [personalMessage, setPersonalMessage] = useState("")
  const [interests, setInterests] = useState("")
  const [heartData, setHeartData] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [wordCount, setWordCount] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recordingError, setRecordingError] = useState("")
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const interimTranscriptRef = useRef("")

  // Determine minimum word count based on user type
  const minWordCount = user?.userType === "legacy" ? 30 : 50

  useEffect(() => {
    if (heartId) {
      const userData = JSON.parse(localStorage.getItem("currentUser") || "{}")
      setUser(userData)

      // Load hearts from the correct localStorage key
      const heartsData = localStorage.getItem("userHearts")
      if (heartsData) {
        const hearts = JSON.parse(heartsData)
        const heart = hearts.find((h: any) => h.id === heartId)
        if (heart) {
          setHeartData(heart)
          setSelectedTone(heart.tone || "")
          setPersonalMessage(heart.personalMessage || "")
          setInterests(heart.interests || "")
        }
      }
    }
  }, [heartId])

  useEffect(() => {
    const words = personalMessage
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    setWordCount(words.length)
  }, [personalMessage])

  // Check speech recognition support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      setSpeechSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onstart = () => {
          setIsListening(true)
          setRecordingError("")
          interimTranscriptRef.current = ""
        }

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

          interimTranscriptRef.current = interimTranscript

          if (finalTranscript.trim()) {
            setPersonalMessage((prev) => {
              const newMessage = prev ? prev + " " + finalTranscript.trim() : finalTranscript.trim()
              return newMessage
            })
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          setRecordingError(`Error: ${event.error}. Try speaking louder or check your microphone.`)
          setIsRecording(false)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
          interimTranscriptRef.current = ""

          if (isRecording) {
            setTimeout(() => {
              if (recognitionRef.current && isRecording) {
                try {
                  recognitionRef.current.start()
                } catch (error) {
                  setIsRecording(false)
                }
              }
            }, 100)
          }
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    setRecordingError("")

    if (!speechSupported) {
      setRecordingError("Speech recognition is not supported. Please use Chrome, Edge, or Safari.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())

      if (recognitionRef.current) {
        setIsRecording(true)
        recognitionRef.current.start()
      }
    } catch (error) {
      setRecordingError("Please allow microphone access and try again.")
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (wordCount < minWordCount) {
      alert(`Please write at least ${minWordCount} words in your personal message.`)
      return
    }

    if (!selectedTone) {
      alert("Please select a tone for your message.")
      return
    }

    const heartsData = localStorage.getItem("userHearts")
    if (heartsData) {
      const hearts = JSON.parse(heartsData)
      const heartIndex = hearts.findIndex((h: any) => h.id === heartId)

      if (heartIndex !== -1) {
        hearts[heartIndex] = {
          ...hearts[heartIndex],
          tone: selectedTone,
          personalMessage,
          interests,
          updatedAt: new Date().toISOString(),
        }

        localStorage.setItem("userHearts", JSON.stringify(hearts))
      }
    }

    router.push("/confirmation?heartId=" + heartId)
  }

  if (!heartData) {
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-black">Personalize Message for {heartData.name}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{heartData.relationship}</Badge>
              <Badge variant="outline">{user?.userType === "legacy" ? "Legacy Plan" : "Whisper Plan"}</Badge>
            </div>
            <p className="text-gray-600 mt-2">
              Help us create the perfect tone and message for your cards to {heartData.name}.
              <span className="block text-sm text-blue-600 mt-1">
                Minimum {minWordCount} words required for your {user?.userType === "legacy" ? "Legacy" : "Whisper"} plan
              </span>
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-black">Preferred Tone *</Label>
                <p className="text-sm text-gray-600">
                  Choose the tone that best fits your relationship with {heartData.name}.
                </p>

                <RadioGroup value={selectedTone} onValueChange={setSelectedTone}>
                  <div className="grid md:grid-cols-2 gap-4">
                    {tones.map((tone) => (
                      <div key={tone.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={tone.id} id={tone.id} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={tone.id} className="font-medium cursor-pointer">
                            {tone.label}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">{tone.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="personal-message" className="text-lg font-semibold text-black">
                    Personal Message *
                  </Label>
                  <span className={`text-sm ${wordCount >= minWordCount ? "text-green-600" : "text-red-600"}`}>
                    {wordCount}/{minWordCount} words minimum
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Write a personal message that captures your feelings for {heartData.name}. This will help us create
                  meaningful card content.
                </p>

                <div className="space-y-3">
                  <Textarea
                    id="personal-message"
                    placeholder={`Share what makes ${heartData.name} special to you, your favorite memories together, or what you want them to know...`}
                    value={
                      personalMessage +
                      (isListening && interimTranscriptRef.current ? " " + interimTranscriptRef.current : "")
                    }
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    className="min-h-[120px]"
                    required
                  />

                  {/* Voice Recording Feature */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">🎤 Voice Feature Works:</h4>
                    <ol className="text-sm text-blue-700 space-y-1 mb-3">
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
                    </ol>

                    {speechSupported ? (
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={isRecording ? stopRecording : startRecording}
                          variant={isRecording ? "destructive" : "outline"}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {isRecording ? (
                            <>
                              <MicOff className="w-4 h-4" />
                              Stop Recording
                            </>
                          ) : (
                            <>
                              <Mic className="w-4 h-4" />
                              Start Recording
                            </>
                          )}
                        </Button>

                        {isListening && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            Listening...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Volume2 className="w-4 h-4" />
                        Voice recording not supported in this browser. Use Chrome, Edge, or Safari.
                      </div>
                    )}

                    {recordingError && (
                      <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">{recordingError}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="interests" className="text-lg font-semibold text-black">
                  Their Interests & Hobbies (Optional)
                </Label>
                <p className="text-sm text-gray-600">
                  Tell us about {heartData.name}'s interests, hobbies, or things they love. This helps us personalize
                  the poetry.
                </p>
                <Textarea
                  id="interests"
                  placeholder={`What does ${heartData.name} enjoy? (gardening, cooking, sports, reading, travel, etc.)`}
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/add-heart?edit=${heartId}`)}
                  className="flex-1"
                >
                  Back to Edit Heart
                </Button>
                <Button
                  type="submit"
                  disabled={wordCount < minWordCount || !selectedTone}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Continue to Review
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">💡 Tips for a Great Message:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Share a specific memory or moment you cherish</li>
              <li>• Express what this person means to you</li>
              <li>• Include wishes or hopes for their future</li>
              <li>• Write in your natural voice - be authentic</li>
              <li>• Use the voice recording feature to speak naturally</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
