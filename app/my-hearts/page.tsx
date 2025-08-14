"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Edit,
  Calendar,
  Trash2,
  Share2,
  Gift,
  Clock,
  AlertTriangle,
  Mail,
  Upload,
  Send,
  LogOut,
  CreditCard,
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { PurchaseCardsModal } from "@/components/purchase-cards-modal"
import { CsvUploadModal } from "@/components/csv-upload-modal"
import { PaymentMethodModal } from "@/components/payment-method-modal"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function MyHearts() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [hearts, setHearts] = useState<any[]>([])
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showCsvUpload, setShowCsvUpload] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [recipientLimitWarning, setRecipientLimitWarning] = useState("")
  const [mailedCardsHistory, setMailedCardsHistory] = useState<any[]>([])

  // Card allocation logic - monthly with 60-day expiration
  const getCardAllocation = () => {
    if (!user) return 2 // Default to 2 if no user
    if (user?.userType === "legacy") {
      return 7 // Legacy: 7 cards per month
    } else {
      return 2 // Whisper: 2 cards per month
    }
  }

  // Card expiration logic - 60 days from allocation
  const checkExpiredCards = () => {
    if (!user || !user.cardAllocations) return

    const now = new Date()
    const updatedAllocations = user.cardAllocations.filter((allocation: any) => {
      const allocationDate = new Date(allocation.date)
      const daysSinceAllocation = differenceInDays(now, allocationDate)
      return daysSinceAllocation < 60
    })

    if (updatedAllocations.length !== user.cardAllocations.length) {
      const expiredCount = user.cardAllocations.length - updatedAllocations.length
      const updatedUser = {
        ...user,
        cardAllocations: updatedAllocations,
        freeCards: Math.max(0, user.freeCards - expiredCount),
      }
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      localStorage.setItem("user", JSON.stringify(updatedUser))

      if (expiredCount > 0) {
        alert(
          `${expiredCount} card${expiredCount > 1 ? "s" : ""} expired after 60 days and have been removed from your account.`,
        )
      }
    }
  }

  // Add monthly card allocation
  const addMonthlyCards = () => {
    if (!user || !user.id) return

    const now = new Date()
    const currentMonth = now.toISOString().slice(0, 7)

    if (!user?.lastCardAllocation || user.lastCardAllocation !== currentMonth) {
      const cardAllocation = getCardAllocation()
      const newAllocation = {
        date: now.toISOString(),
        count: cardAllocation,
        month: currentMonth,
      }

      const updatedUser = {
        ...user,
        freeCards: (user.freeCards || 0) + cardAllocation,
        cardAllocations: [...(user.cardAllocations || []), newAllocation],
        lastCardAllocation: currentMonth,
      }

      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("currentUser") || "{}")
    if (userData && Object.keys(userData).length > 0) {
      // Check if email is verified
      if (!userData.emailVerified) {
        router.push("/auth")
        return
      }
      setUser(userData)
      setHearts(userData.hearts || [])
      setMailedCardsHistory(userData.mailedCards || [])
    } else {
      router.push("/auth")
    }
  }, [router])

  useEffect(() => {
    if (user && user.id) {
      checkExpiredCards()
      addMonthlyCards()
    }
  }, [user])

  const checkRecipientLimit = (recipientAddress: string) => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const globalLimits = JSON.parse(localStorage.getItem("globalRecipientLimits") || "{}")
    const monthlyLimits = globalLimits[currentMonth] || {}
    const currentCount = monthlyLimits[recipientAddress.toLowerCase()] || 0

    return {
      count: currentCount,
      canSend: currentCount < 3,
      remaining: 3 - currentCount,
    }
  }

  const updateRecipientLimit = (recipientAddress: string) => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const globalLimits = JSON.parse(localStorage.getItem("globalRecipientLimits") || "{}")

    if (!globalLimits[currentMonth]) {
      globalLimits[currentMonth] = {}
    }

    const addressKey = recipientAddress.toLowerCase()
    globalLimits[currentMonth][addressKey] = (globalLimits[currentMonth][addressKey] || 0) + 1

    localStorage.setItem("globalRecipientLimits", JSON.stringify(globalLimits))
  }

  const handleEdit = (heartId: string) => {
    router.push(`/add-heart?edit=${heartId}`)
  }

  const handleSendCardNow = (heart: any) => {
    const subject = `Urgent Card Request - ${heart.name}`
    const body = `Hello,

I need to send a card immediately to:
Name: ${heart.name}
Address: ${heart.address}, ${heart.city}, ${heart.state} ${heart.zipCode}
Relationship: ${heart.relationship}

Reason for urgent request: [Please specify your reason]
Needed by date: [Please specify date]

Thank you,
${user.firstName} ${user.lastName}
${user.email}`

    window.location.href = `mailto:info@writeourheart.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleScheduleCard = (heart: any) => {
    const recipientAddress = `${heart.address}, ${heart.city}, ${heart.state} ${heart.zipCode}`.trim()
    const limitCheck = checkRecipientLimit(recipientAddress)

    if (!limitCheck.canSend) {
      setRecipientLimitWarning(
        `Global limit reached: This address has already received 3 cards this month from all users combined. To protect recipients from being overwhelmed, each address can only receive 3 cards per month. Would you like to update their address to continue?`,
      )
      return
    }

    if (limitCheck.remaining === 1) {
      if (
        !confirm(
          `This will be your last card to ${heart.name}'s address this month (${limitCheck.count + 1}/3). Continue?`,
        )
      ) {
        return
      }
    }

    if (user.freeCards > 0) {
      updateRecipientLimit(recipientAddress)

      const updatedUser = {
        ...user,
        freeCards: user.freeCards - 1,
        usedCards: (user.usedCards || 0) + 1,
      }
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      localStorage.setItem("user", JSON.stringify(updatedUser))

      setTimeout(() => {
        const saveWriting = confirm(
          `Card for ${heart.name} has been scheduled! 📮\n\nWould you like to save this writing for future use?`,
        )
        if (saveWriting) {
          alert("Writing saved to your library! ✅")
        }
      }, 2000)

      alert(`Card scheduled for ${heart.name}! You'll receive an email when it's mailed.`)

      const newMailedCard = {
        recipientName: heart.name,
        recipientAddress: recipientAddress,
        dateMailed: new Date().toISOString(),
      }

      const updatedMailedCardsHistory = [...mailedCardsHistory, newMailedCard]
      setMailedCardsHistory(updatedMailedCardsHistory)

      const updatedUserWithMailedCards = {
        ...updatedUser,
        mailedCards: updatedMailedCardsHistory,
      }
      setUser(updatedUserWithMailedCards)
      localStorage.setItem("currentUser", JSON.stringify(updatedUserWithMailedCards))
      localStorage.setItem("user", JSON.stringify(updatedUserWithMailedCards))
    } else {
      alert("No card credits available. Please wait for your monthly credit or purchase additional cards.")
    }
  }

  const handleDelete = (heartId: string) => {
    if (confirm("Are you sure you want to delete this Heart? This action cannot be undone.")) {
      const updatedHearts = hearts.filter((h) => h.id !== heartId)
      const updatedUser = { ...user, hearts: updatedHearts }

      setHearts(updatedHearts)
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  const handleReferFriend = () => {
    const referralLink = `${window.location.origin}?ref=${user.email}`
    const message = `Check out Write Our Heart - the easiest way to send personalized greeting cards! Sign up with my link and we both get 2 free cards: ${referralLink}`

    if (navigator.share) {
      navigator.share({
        title: "Write Our Heart - Personalized Greeting Cards",
        text: message,
        url: referralLink,
      })
    } else {
      navigator.clipboard.writeText(message)
      alert("Referral link copied to clipboard!")
    }
  }

  const handlePurchaseCards = (quantity: number) => {
    const updatedUser = {
      ...user,
      freeCards: user.freeCards + quantity,
      purchasedCards: (user.purchasedCards || 0) + quantity,
    }
    setUser(updatedUser)
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    localStorage.setItem("user", JSON.stringify(updatedUser))
    alert(`Successfully purchased ${quantity} additional card${quantity > 1 ? "s" : ""}! 🎉`)
  }

  const handleCsvUpload = (newHearts: any[]) => {
    const updatedHearts = [...hearts, ...newHearts]
    const updatedUser = { ...user, hearts: updatedHearts }

    setHearts(updatedHearts)
    setUser(updatedUser)
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    localStorage.setItem("user", JSON.stringify(updatedUser))

    alert(`Successfully imported ${newHearts.length} hearts! 🎉`)
  }

  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem("currentUser")
      localStorage.removeItem("user")
      router.push("/")
    }
  }

  const totalCards = (user?.freeCards || 0) + (user?.referralCards || 0)
  const daysUntilExpiry = user?.cardCreditsExpiry ? differenceInDays(new Date(user.cardCreditsExpiry), new Date()) : 0

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
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md p-2">
                <img src="/logo.png" alt="Write Our Heart" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">Hi {user.firstName}, Welcome Back!</h1>
                <p className="text-gray-600">Manage your Hearts and schedule meaningful cards</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-yellow-500 text-black">
                    {user.userType === "legacy" ? "Legacy Beta" : "Whisper Beta"}
                  </Badge>
                  {user.betaPricing && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Beta Pricing Locked
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    ✓ Email Verified
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowPaymentModal(true)}
                variant="outline"
                className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                <CreditCard className="w-4 h-4" />
                Payment Methods
              </Button>

              <Button
                onClick={handleSignOut}
                variant="outline"
                className="flex items-center gap-2 border-red-500 text-red-600 hover:bg-red-50 bg-transparent"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-yellow-600" />
                  <div className="text-sm">
                    <div className="font-semibold text-black">{totalCards} Cards Available</div>
                    <div className="text-gray-600">
                      {user.freeCards} free • {user.referralCards || 0} referral
                    </div>
                    <div className="text-xs text-gray-500">
                      Monthly: {getCardAllocation()} card{getCardAllocation() > 1 ? "s" : ""} • Expire in 60 days
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleReferFriend}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
              >
                <Share2 className="w-4 h-4" />
                Refer Friend (+2 cards)
              </Button>
              {totalCards === 0 && (
                <Button
                  onClick={() => setShowPurchaseModal(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                >
                  <Plus className="w-4 h-4" />
                  Buy Cards ($4.99 each)
                </Button>
              )}
            </div>
          </div>

          {/* Warnings and Notifications */}
          <div className="mt-4 space-y-3">
            {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-800">
                    Your card credits expire in {daysUntilExpiry} days (60-day limit). Schedule cards now to avoid
                    losing them!
                  </span>
                </div>
              </div>
            )}

            {recipientLimitWarning && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">{recipientLimitWarning}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setRecipientLimitWarning("")}>
                      Cancel
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Update Address
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="font-semibold text-blue-800">Cards This Month</div>
              <div className="text-blue-600">
                {user.usedCards || 0} used • {user.freeCards || 0} remaining
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="font-semibold text-green-800">Monthly Allocation</div>
              <div className="text-green-600">{getCardAllocation()} cards/month</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="font-semibold text-purple-800">Card Expiration</div>
              <div className="text-purple-600">60 days from issue</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="font-semibold text-yellow-800">Plan</div>
              <div className="text-yellow-600">
                {user.userType === "legacy" ? "Legacy" : "Whisper"} - ${user.userType === "legacy" ? "25.99" : "8.99"}
                /mo
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="mailed-cards-history">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Mailed Cards History ({mailedCardsHistory.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {mailedCardsHistory.length === 0 ? (
                  <p className="text-sm text-gray-500">No cards mailed yet.</p>
                ) : (
                  <ul className="list-disc pl-5 text-sm">
                    {mailedCardsHistory.map((card, index) => (
                      <li key={index} className="text-gray-600">
                        Sent to {card.recipientName} ({card.recipientAddress}) on{" "}
                        {format(new Date(card.dateMailed), "MMM dd, yyyy")}
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {hearts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <Plus className="w-10 h-10 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-black mb-2">No Hearts Added Yet</h2>
              <p className="text-gray-600 mb-6">Add your first Heart to start sending personalized greeting cards</p>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={() => router.push("/add-heart")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Heart
                </Button>
                <Button
                  onClick={() => setShowCsvUpload(true)}
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import from CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-black">Your Hearts ({hearts.length})</h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowCsvUpload(true)}
                  variant="outline"
                  className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <Upload className="w-4 h-4" />
                  Import CSV
                </Button>
                <Button
                  onClick={() => router.push("/add-heart")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Heart
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hearts.map((heart) => {
                const recipientAddress = `${heart.address}, ${heart.city}, ${heart.state} ${heart.zipCode}`.trim()
                const limitCheck = checkRecipientLimit(recipientAddress)

                return (
                  <Card key={heart.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-black">{heart.name}</CardTitle>
                          <p className="text-sm text-gray-600">{heart.relationship}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(heart.id)} className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-1 text-sm">
                        {heart.email && <p className="text-gray-600">{heart.email}</p>}
                        {heart.phone && <p className="text-gray-600">{heart.phone}</p>}
                        {heart.address && (
                          <div>
                            <p className="text-gray-600">
                              {heart.address}
                              {heart.city && `, ${heart.city}`}
                              {heart.state && `, ${heart.state}`}
                              {heart.zipCode && ` ${heart.zipCode}`}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  limitCheck.remaining === 0
                                    ? "bg-red-500"
                                    : limitCheck.remaining === 1
                                      ? "bg-orange-500"
                                      : "bg-green-500"
                                }`}
                              ></div>
                              <span className="text-xs text-gray-500">
                                {limitCheck.remaining}/3 cards allowed to this address this month (global limit)
                              </span>
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              ℹ️ This protects recipients from getting too many cards
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-black mb-2">Occasions:</p>
                        <div className="flex flex-wrap gap-1">
                          {heart.occasions?.slice(0, 3).map((occasion: string) => (
                            <Badge key={occasion} variant="secondary" className="text-xs">
                              {occasion === "other" ? heart.otherOccasion : occasion}
                            </Badge>
                          ))}
                          {heart.occasions?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{heart.occasions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {heart.occasionDates && Object.keys(heart.occasionDates).length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-black mb-2">Upcoming:</p>
                          <div className="space-y-1">
                            {Object.entries(heart.occasionDates)
                              .slice(0, 2)
                              .map(([occasion, date]: [string, any]) => (
                                <div key={occasion} className="flex items-center gap-2 text-xs text-gray-600">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {occasion === "other" ? heart.otherOccasion : occasion} -{" "}
                                    {format(new Date(date), "MMM dd")}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleSendCardNow(heart)}
                          size="sm"
                          variant="outline"
                          className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Send Card Now
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleScheduleCard(heart)}
                          size="sm"
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                          disabled={totalCards === 0 || limitCheck.remaining === 0}
                        >
                          {limitCheck.remaining === 0 ? "Address Limit Reached" : "Schedule Card"}
                        </Button>
                        <Button
                          onClick={() => handleDelete(heart.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {totalCards === 0 && (
                        <div className="text-center pt-2">
                          <div className="text-xs text-red-600 mb-2">
                            No cards available. Wait for monthly credit or:
                          </div>
                          <Button
                            onClick={() => setShowPurchaseModal(true)}
                            size="sm"
                            variant="outline"
                            className="text-xs border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                          >
                            Buy Additional Cards ($4.99 each)
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <a href="/faq" className="text-sm text-yellow-600 hover:text-yellow-700">
            View FAQ & Terms →
          </a>
        </div>
      </div>

      <PurchaseCardsModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchase={handlePurchaseCards}
        userType={user.userType}
      />

      <CsvUploadModal
        isOpen={showCsvUpload}
        onClose={() => setShowCsvUpload(false)}
        onUploadComplete={handleCsvUpload}
      />

      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        user={user}
        onUpdate={(updatedUser) => {
          setUser(updatedUser)
          localStorage.setItem("currentUser", JSON.stringify(updatedUser))
          localStorage.setItem("user", JSON.stringify(updatedUser))
        }}
      />
    </div>
  )
}
