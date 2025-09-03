"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Plus, Trash2, Star, AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface PaymentMethod {
  id: string
  type: "visa" | "mastercard" | "amex" | "discover"
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
}

interface PaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onUpdate: (updatedUser: any) => void
}

export function PaymentMethodModal({ isOpen, onClose, user, onUpdate }: PaymentMethodModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoadingMethods, setIsLoadingMethods] = useState(true)

  useEffect(() => {
    if (isOpen && user?.customerId) {
      fetchPaymentMethods()
    }
  }, [isOpen, user?.customerId])

  const fetchPaymentMethods = async () => {
    if (!user?.customerId) {
      setIsLoadingMethods(false)
      return
    }

    try {
      setIsLoadingMethods(true)
      const response = await fetch(`/api/stripe/payment-methods?customerId=${user.customerId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch payment methods")
      }

      const data = await response.json()
      setPaymentMethods(data.paymentMethods || [])
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      toast.error("Failed to load payment methods")
      setPaymentMethods([])
    } finally {
      setIsLoadingMethods(false)
    }
  }

  const getCardIcon = (type: string) => {
    const icons = {
      visa: "💳",
      mastercard: "💳",
      amex: "💳",
      discover: "💳",
    }
    return icons[type as keyof typeof icons] || "💳"
  }

  const getCardName = (type: string) => {
    const names = {
      visa: "Visa",
      mastercard: "Mastercard",
      amex: "American Express",
      discover: "Discover",
    }
    return names[type as keyof typeof names] || "Card"
  }

  const handleSetDefault = async (paymentMethodId: string) => {
    if (!user?.customerId) {
      toast.error("Customer ID not found")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/stripe/set-default-payment-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: user.customerId,
          paymentMethodId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to set default payment method")
      }

      // Update local state
      const updatedMethods = paymentMethods.map((pm) => ({
        ...pm,
        isDefault: pm.id === paymentMethodId,
      }))
      setPaymentMethods(updatedMethods)

      // Update user data
      const updatedUser = {
        ...user,
        defaultPaymentMethod: paymentMethodId,
      }
      onUpdate(updatedUser)

      toast.success("Default payment method updated successfully!")
    } catch (error) {
      console.error("Error setting default payment method:", error)
      toast.error("Failed to update default payment method. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveCard = async (paymentMethodId: string) => {
    const cardToRemove = paymentMethods.find((pm) => pm.id === paymentMethodId)
    if (cardToRemove?.isDefault && paymentMethods.length > 1) {
      toast.error("You cannot remove your default payment method. Please set another card as default first.")
      return
    }

    if (!confirm("Are you sure you want to remove this payment method?")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/stripe/detach-payment-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to remove payment method")
      }

      // Update local state
      const updatedMethods = paymentMethods.filter((pm) => pm.id !== paymentMethodId)
      setPaymentMethods(updatedMethods)

      toast.success("Payment method removed successfully!")
    } catch (error) {
      console.error("Error removing payment method:", error)
      toast.error("Failed to remove payment method. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCard = async () => {
    if (!user?.customerId) {
      toast.error("Customer ID not found")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/stripe/create-setup-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: user.customerId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create setup intent")
      }

      const { clientSecret } = await response.json()

      // Redirect to payment method setup page with client secret
      const setupUrl = `/setup-payment-method?setup_intent_client_secret=${clientSecret}`
      window.location.href = setupUrl
    } catch (error) {
      console.error("Error creating setup intent:", error)
      toast.error("Failed to setup payment method. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const openStripePortal = async () => {
    if (!user?.customerId) {
      toast.error("Customer ID not found")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: user.customerId,
          returnUrl: window.location.href,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create portal session")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Error creating portal session:", error)
      toast.error("Failed to open billing portal. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </DialogTitle>
          <DialogDescription>Manage your payment methods and billing information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.plan === "legacy" ? "Legacy Beta Plan" : "Whisper Beta Plan"}</p>
                  <p className="text-sm text-gray-600">${user.plan === "legacy" ? "19.99" : "9.99"}/month</p>
                  <p className="text-xs text-green-600 mt-1">✓ Beta pricing locked in</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Saved Payment Methods</h3>
              <Button onClick={handleAddCard} size="sm" className="flex items-center gap-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Card
              </Button>
            </div>

            {isLoadingMethods ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
                  <p className="text-gray-600">Loading payment methods...</p>
                </CardContent>
              </Card>
            ) : paymentMethods.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">No payment methods saved</p>
                  <Button onClick={handleAddCard} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Add Your First Card
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <Card key={method.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getCardIcon(method.type)}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {getCardName(method.type)} •••• {method.last4}
                              </p>
                              {method.isDefault && (
                                <Badge variant="outline" className="text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              Expires {method.expiryMonth.toString().padStart(2, "0")}/{method.expiryYear}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!method.isDefault && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(method.id)}
                              disabled={isLoading}
                            >
                              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Set Default"}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveCard(method.id)}
                            disabled={isLoading || (method.isDefault && paymentMethods.length === 1)}
                            className="text-red-600 hover:text-red-700"
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Warning for last payment method */}
          {paymentMethods.length === 1 && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                This is your only payment method. Add another card before removing this one to avoid service
                interruption.
              </AlertDescription>
            </Alert>
          )}

          {/* Stripe Portal Link */}
          <div className="border-t pt-4">
            <Button variant="outline" onClick={openStripePortal} className="w-full bg-transparent" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Manage Billing in Stripe Portal
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Access full billing history, invoices, and advanced payment settings
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
