"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronDown, ChevronUp, Mail, MapPin } from "lucide-react"
import { format } from "date-fns"

interface MailedCard {
  id: string
  recipientName: string
  recipientAddress: string
  occasion: string
  dateMailed: string
  trackingNumber?: string
  deliveryStatus: "mailed" | "in-transit" | "delivered"
  cardType: string
}

interface MailedCardsHistoryProps {
  userId: string
}

export function MailedCardsHistory({ userId }: MailedCardsHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Mock data - in real app this would come from your database
  const mailedCards: MailedCard[] = [
    {
      id: "1",
      recipientName: "Sarah Johnson",
      recipientAddress: "123 Main St, Anytown, ST 12345",
      occasion: "Birthday",
      dateMailed: "2024-01-15",
      trackingNumber: "1234567890",
      deliveryStatus: "delivered",
      cardType: "Premium Birthday Card",
    },
    {
      id: "2",
      recipientName: "Mom",
      recipientAddress: "456 Oak Ave, Hometown, ST 67890",
      occasion: "Mother's Day",
      dateMailed: "2024-01-10",
      trackingNumber: "0987654321",
      deliveryStatus: "in-transit",
      cardType: "Heartfelt Mother's Day Card",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "in-transit":
        return "bg-blue-100 text-blue-800"
      case "mailed":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return "✅"
      case "in-transit":
        return "🚚"
      case "mailed":
        return "📮"
      default:
        return "📋"
    }
  }

  if (!isExpanded) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Mailed Cards History ({mailedCards.length})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(true)} className="flex items-center gap-2">
              View History <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Mailed Cards History - {selectedYear}
          </CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)} className="flex items-center gap-2">
              Hide <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {mailedCards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No cards mailed yet this year</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mailedCards.map((card) => (
              <div key={card.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-black">{card.recipientName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {card.occasion}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(card.deliveryStatus)}`}>
                        {getStatusIcon(card.deliveryStatus)} {card.deliveryStatus.replace("-", " ")}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{card.recipientAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>Mailed: {format(new Date(card.dateMailed), "MMM dd, yyyy")}</span>
                      </div>
                      {card.trackingNumber && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs">Tracking: {card.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-sm">
                    <div className="font-medium text-black">{card.cardType}</div>
                    {card.deliveryStatus === "delivered" && (
                      <div className="text-green-600 text-xs mt-1">Delivered ✅</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
