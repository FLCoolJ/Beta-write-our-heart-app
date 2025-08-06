"use client"

import { CardProductionDashboard } from "@/components/card-production-dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CardProductionPage() {
  return (
    <div className="space-y-6">
      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Production System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Badge className="bg-green-500 text-white mb-2">Active</Badge>
              <h4 className="font-semibold">Leonardo.ai</h4>
              <p className="text-sm text-gray-600">Artwork Generation</p>
            </div>
            <div className="text-center">
              <Badge className="bg-green-500 text-white mb-2">Active</Badge>
              <h4 className="font-semibold">Anthropic Claude</h4>
              <p className="text-sm text-gray-600">Poetry Generation</p>
            </div>
            <div className="text-center">
              <Badge className="bg-purple-500 text-white mb-2">Ready</Badge>
              <h4 className="font-semibold">Templated.io</h4>
              <p className="text-sm text-gray-600">Card Assembly</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <CardProductionDashboard />
    </div>
  )
}
