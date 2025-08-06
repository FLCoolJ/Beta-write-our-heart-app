"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2, MapPin } from "lucide-react"

interface AddressValidatorProps {
  onValidationComplete: (validatedAddress: any) => void
  initialAddress?: {
    address: string
    city: string
    state: string
    zipCode: string
  }
}

export function AddressValidator({ onValidationComplete, initialAddress }: AddressValidatorProps) {
  const [address, setAddress] = useState(initialAddress?.address || "")
  const [city, setCity] = useState(initialAddress?.city || "")
  const [state, setState] = useState(initialAddress?.state || "")
  const [zipCode, setZipCode] = useState(initialAddress?.zipCode || "")
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [error, setError] = useState("")

  const handleValidate = async () => {
    if (!address.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
      setError("Please fill in all address fields")
      return
    }

    setIsValidating(true)
    setError("")
    setValidationResult(null)

    try {
      const response = await fetch("/api/usps/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Validation failed")
      }

      setValidationResult(data)
      onValidationComplete(data.validatedAddress)
    } catch (err: any) {
      console.error("Address validation error:", err)
      setError(err.message || "Failed to validate address")
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Address Validation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="New York" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="NY"
                maxLength={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="10001"
              maxLength={10}
            />
          </div>
        </div>

        <Button
          onClick={handleValidate}
          disabled={isValidating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isValidating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Validating with USPS...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate Address with USPS
            </>
          )}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">❌ Address validation failed</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {validationResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">✅ Address validated successfully!</span>
            </div>
            <div className="text-sm text-green-700">
              <p>
                <strong>Validated Address:</strong>
              </p>
              <p>{validationResult.validatedAddress.streetAddress}</p>
              <p>
                {validationResult.validatedAddress.city}, {validationResult.validatedAddress.state}{" "}
                {validationResult.validatedAddress.zipCode}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
