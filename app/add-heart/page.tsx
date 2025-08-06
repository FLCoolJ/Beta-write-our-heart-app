'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Mic, Square, Trash2, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from "@/components/ui/use-toast"

type Address = {
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip5: string;
  zip4: string;
};

export default function AddHeartPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [recipientName, setRecipientName] = useState('')
  const [occasion, setOccasion] = useState('')
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>()
  const [message, setMessage] = useState('')
  const [address, setAddress] = useState<Address>({ address1: '', address2: '', city: '', state: '', zip5: '', zip4: '' })
  const [isAddressValidated, setIsAddressValidated] = useState(false)
  const [isValidationLoading, setIsValidationLoading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const isFormComplete = recipientName && occasion && deliveryDate && message && isAddressValidated

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddress(prev => ({ ...prev, [name]: value }))
    setIsAddressValidated(false)
    setValidationError(null)
  }

  const handleValidateAddress = async () => {
    setIsValidationLoading(true)
    setValidationError(null)
    try {
      const response = await fetch('/api/usps/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        setValidationError(data.error || 'Invalid address. Please check and try again.')
        setIsAddressValidated(false)
      }
    } catch (error) {
      console.error('USPS validation error:', error)
      setValidationError('Could not connect to USPS. You can skip validation to continue.')
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioUrl(audioUrl)
        stream.getTracks().forEach(track => track.stop());
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast({
        title: "Microphone Error",
        description: "Could not access the microphone. Please check your browser permissions.",
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

  const deleteRecording = () => {
    setAudioUrl(null)
    if (mediaRecorderRef.current) {
        mediaRecorderRef.current = null
    }
    audioChunksRef.current = []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormComplete) {
      toast({
        title: "Incomplete Form",
        description: "Please fill out all fields and validate the address.",
        variant: "destructive",
      })
      return
    }
    setIsSubmitting(true)
    try {
      const heartData = {
        recipientName,
        occasion,
        deliveryDate: deliveryDate?.toISOString(),
        message,
        address,
        audioUrl,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      
      const currentUserStr = localStorage.getItem('currentUser')
      if (currentUserStr) {
        const userData = JSON.parse(currentUserStr)
        userData.hearts = [...(userData.hearts || []), heartData]
        localStorage.setItem('currentUser', JSON.stringify(userData))
      } else {
        // Handle case where there is no current user
        const newUser = { hearts: [heartData] }
        localStorage.setItem('currentUser', JSON.stringify(newUser))
      }

      toast({
        title: "Heart Saved!",
        description: "Your new heart has been saved successfully.",
      })
      router.push('/my-hearts')
    } catch (error) {
      console.error('Error saving heart:', error)
      toast({
        title: "Save Failed",
        description: "An error occurred while saving your heart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Add a New Heart</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient's Name</Label>
                <Input id="recipientName" value={recipientName} onChange={e => setRecipientName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occasion">Occasion</Label>
                <Input id="occasion" value={occasion} onChange={e => setOccasion(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Preferred Delivery Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? format(deliveryDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={deliveryDate} onSelect={setDeliveryDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Your Message (min 25 words)</Label>
              <Textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={5} required />
              <p className="text-sm text-muted-foreground">{message.split(/\s+/).filter(Boolean).length} words</p>
            </div>
            <div className="space-y-2">
              <Label>Voice Message (Optional)</Label>
              <div className="flex items-center gap-4">
                {!isRecording && !audioUrl && (
                  <Button type="button" onClick={startRecording}><Mic className="mr-2 h-4 w-4" /> Record</Button>
                )}
                {isRecording && (
                  <Button type="button" onClick={stopRecording} variant="destructive"><Square className="mr-2 h-4 w-4" /> Stop</Button>
                )}
                {audioUrl && (
                  <>
                    <audio src={audioUrl} controls />
                    <Button type="button" onClick={deleteRecording} variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Mailing Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address1">Address Line 1</Label>
                  <Input id="address1" name="address1" value={address.address1} onChange={handleAddressChange} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                  <Input id="address2" name="address2" value={address.address2} onChange={handleAddressChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" value={address.city} onChange={handleAddressChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" value={address.state} onChange={handleAddressChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip5">ZIP Code</Label>
                  <Input id="zip5" name="zip5" value={address.zip5} onChange={handleAddressChange} required />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button type="button" onClick={handleValidateAddress} disabled={isValidationLoading || isAddressValidated}>
                  {isValidationLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isAddressValidated ? <><CheckCircle className="mr-2 h-4 w-4" /> Validated</> : 'Validate Address with USPS'}
                </Button>
                {validationError && (
                  <Button type="button" onClick={handleSkipValidation} variant="secondary">Skip Validation</Button>
                )}
              </div>
              {validationError && <p className="text-sm text-destructive flex items-center"><AlertCircle className="h-4 w-4 mr-2" /> {validationError}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={!isFormComplete || isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Continue to Dashboard'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
