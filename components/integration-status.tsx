"use client"

import { CheckCircle, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function IntegrationStatus() {
  return (
    <div className="space-y-4">
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Canva Integration Status:</strong> Under Review
          <br />
          <span className="text-sm text-muted-foreground">
            Expected approval: 3-7 business days. You can continue testing with template links.
          </span>
        </AlertDescription>
      </Alert>

      <div className="grid gap-2 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>App submitted for review</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>Redirect URLs configured</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>Scopes properly set</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-600" />
          <span>Awaiting Canva team review</span>
        </div>
      </div>
    </div>
  )
}
