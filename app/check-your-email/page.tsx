"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function CheckYourEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/auth" className="flex items-center gap-2 text-gray-600 hover:text-yellow-600">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
            <div className="flex items-center gap-2">
              <img src="/new-logo-symbol.png" alt="Write Our Heart" className="h-8 w-8" />
              <span className="font-bold text-yellow-600">Write Our Heart</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center gap-2 text-green-600 justify-center">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Account created successfully!</span>
            </div>

            <p className="text-gray-600">
              We've sent a verification link to your email address. Click the link to verify your account and complete
              your signup.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Tips:</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Check your spam or promotions folder</li>
                <li>• The link expires in 24 hours</li>
                <li>• Make sure to click the link from the same device</li>
              </ul>
            </div>

            <Button
              asChild
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
            >
              <Link href="/auth">Back to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
