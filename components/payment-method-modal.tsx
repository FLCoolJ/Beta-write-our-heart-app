"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Plus, Trash2, Star, AlertTriangle } from "lucide-react"

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
  const [showAddCard, setShowAddCard] = useState(false)

  // Mock payment methods - in production, fetch from Stripe
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "pm_1234567890",
      type: "visa",
      last4: "4242",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: "pm_0987654321",
      type: "mastercard",
      last4: "5555",
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false,
    },
  ])

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
    setIsLoading(true)
    try {
      // In production, call Stripe API to set default payment method
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

      alert("Default payment method updated successfully!")
    } catch (error) {
      console.error("Error setting default payment method:", error)
      alert("Failed to update default payment method. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveCard = async (paymentMethodId: string) => {
    if (!confirm("Are you sure you want to remove this payment method?")) {
      return
    }

    const cardToRemove = paymentMethods.find((pm) => pm.id === paymentMethodId)
    if (cardToRemove?.isDefault && paymentMethods.length > 1) {
      alert("You cannot remove your default payment method. Please set another card as default first.")
      return
    }

    setIsLoading(true)
    try {
      // In production, call Stripe API to detach payment method
      const updatedMethods = paymentMethods.filter((pm) => pm.id !== paymentMethodId)
      setPaymentMethods(updatedMethods)

      alert("Payment method removed successfully!")
    } catch (error) {
      console.error("Error removing payment method:", error)
      alert("Failed to remove payment method. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCard = () => {
    // In production, integrate with Stripe Elements or redirect to Stripe Customer Portal
    alert("This would open Stripe payment method setup. For demo purposes, this is not implemented.")
  }

  const openStripePortal = () => {
    // In production, redirect to Stripe Customer Portal
    alert("This would redirect to Stripe Customer Portal for full payment management.")
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
                  <p className="font-medium">{user.userType === "legacy" ? "Legacy Beta Plan" : "Whisper Beta Plan"}</p>
                  <p className="text-sm text-gray-600">${user.userType === "legacy" ? "25.99" : "8.99"}/month</p>
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
              <Button onClick={handleAddCard} size="sm" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Card
              </Button>
            </div>

            {paymentMethods.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">No payment methods saved</p>
                  <Button onClick={handleAddCard}>Add Your First Card</Button>
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
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveCard(method.id)}
                            disabled={isLoading || (method.isDefault && paymentMethods.length === 1)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
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
            <Button variant="outline" onClick={openStripePortal} className="w-full bg-transparent">
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
