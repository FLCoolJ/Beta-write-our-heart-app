"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, CheckCircle, AlertCircle, Loader2, Copy, Info, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CanvaAuthButton() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authUrl, setAuthUrl] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")

  useEffect(() => {
    // Check URL params for auth results
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get("canva_token")
    const error = urlParams.get("error")
    const message = urlParams.get("message")
    const successParam = urlParams.get("success")

    // Enhanced debug info
    const clientId = process.env.NEXT_PUBLIC_CANVA_CLIENT_ID
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    setDebugInfo(`
🔧 CANVA APP CONFIGURATION ISSUE DETECTED
Client ID: ${clientId || "Missing ❌"} ${clientId?.startsWith("OC-") || clientId?.startsWith("OC_") ? "✅" : "❌ Invalid format"}
App URL: ${appUrl || "Not set ❌"}
Current URL: ${typeof window !== "undefined" ? window.location.origin : "N/A"}
Expected callback: ${appUrl}/api/canva/callback

❌ PROBLEM: You're configuring OAuth PROVIDERS (Google, Facebook login)
✅ SOLUTION: You need your app to BE an OAuth CLIENT for Canva's API

🎯 WHAT YOU'RE SEEING:
- "Add Provider" = Adding login methods TO your app
- Client ID/Secret fields = For external providers (Google, etc.)
- Development URL localhost error = Embedded app requirements

🎯 WHAT YOU NEED:
- Your app as OAuth CLIENT
- Canva as OAuth PROVIDER  
- REST API access to create designs
    `)

    if (error) {
      setError(decodeURIComponent(message || "Authentication failed"))
      setIsAuthorized(false)
      setIsLoading(false)
    } else if (token && successParam) {
      setIsAuthorized(true)
      setSuccess("Successfully connected to Canva! 🎉")
      setIsLoading(false)
      localStorage.setItem("canva_token", token)
    } else {
      const storedToken = localStorage.getItem("canva_token")
      if (storedToken) {
        setIsAuthorized(true)
      }
    }

    // Clean up URL params
    if (token || error || successParam) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Generate auth URL using server-side endpoint
    generateAuthUrl()
  }, [])

  const generateAuthUrl = async () => {
    try {
      const response = await fetch("/api/canva/auth")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to generate auth URL: ${response.status} - ${errorData.error}`)
      }

      const data = await response.json()
      setAuthUrl(data.authUrl)

      console.log("Generated auth URL:", data.authUrl)
    } catch (err) {
      setError(`Failed to generate auth URL: ${err.message}`)
    }
  }

  const handleAuth = () => {
    if (!authUrl) {
      setError("Cannot generate auth URL - check configuration")
      return
    }

    setError("")
    setSuccess("")
    setIsLoading(true)

    console.log("Starting auth flow...")
    console.log("Redirecting to:", authUrl)

    // Add timeout to stop loading if redirect fails
    setTimeout(() => {
      setIsLoading(false)
      setError("Redirect timed out - check if popup was blocked")
    }, 10000)

    window.location.href = authUrl
  }

  const handleDisconnect = () => {
    localStorage.removeItem("canva_token")
    localStorage.removeItem("canva_refresh_token")
    setIsAuthorized(false)
    setSuccess("")
    setError("")
  }

  const copyAuthUrl = () => {
    navigator.clipboard.writeText(authUrl)
    alert("Auth URL copied to clipboard!")
  }

  return (
    <div className="space-y-3">
      {/* Beautiful Site Preview */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-4 rounded-lg text-center">
        <div className="bg-white rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
          <div className="text-yellow-600 text-xl">💛</div>
        </div>
        <h3 className="font-bold text-white">Write Our Heart</h3>
        <p className="text-white/90 text-sm">Your beautiful greeting card site is ready!</p>
      </div>

      {/* Configuration Issue Alert */}
      <Alert variant="destructive">
        <X className="h-4 w-4" />
        <AlertDescription>
          <strong>🚨 Configuration Issue Detected:</strong>
          <br />
          You're looking at OAuth PROVIDER settings (for adding Google/Facebook login to your app).
          <br />
          <br />
          <strong>What you're seeing:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>"Add Provider" = Adding login methods TO your Canva app</li>
            <li>Client ID/Secret = For external providers (Google, Facebook, etc.)</li>
            <li>Development URL localhost error = Embedded app requirements</li>
          </ul>
          <br />
          <strong>What you need:</strong>
          <ul className="list-disc list-inside space-y-1">
            <li>Your app to call Canva's REST API</li>
            <li>OAuth CLIENT credentials from Canva</li>
            <li>Permission to create designs programmatically</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Correct Configuration Steps */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>📋 Correct Configuration Steps:</strong>
          <br />
          <br />
          <strong>Option 1: Skip OAuth Provider Setup</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Skip the "Add Provider" section entirely</li>
            <li>Go to "App listing details" tab</li>
            <li>Fill out your app information</li>
            <li>Submit for review</li>
            <li>Get Client ID/Secret from Canva after approval</li>
          </ol>
          <br />
          <strong>Option 2: Configure for Embedded App</strong>
          <ol className="list-decimal list-inside space-y-1">
            <li>Set Development URL to: http://localhost:8080</li>
            <li>Upload a simple HTML file as App Source</li>
            <li>Configure for embedded use (runs inside Canva)</li>
            <li>This is more complex but gives you Canva's UI</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Embedded App Configuration Help */}
      <Alert variant="default">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>🔧 If you want to continue with embedded app:</strong>
          <br />
          <br />
          <strong>Configuration Tab:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>
              <strong>Development URL:</strong> http://localhost:8080
            </li>
            <li>
              <strong>App Source:</strong> Upload a simple HTML file
            </li>
          </ul>
          <br />
          <strong>Authentication Tab:</strong>
          <ul className="list-disc list-inside space-y-1">
            <li>Skip "Add Provider" section</li>
            <li>Or add if you want user login features</li>
          </ul>
          <br />
          <strong>Note:</strong> Embedded apps run inside Canva's interface, not on your website.
        </AlertDescription>
      </Alert>

      {/* Simple HTML File for App Source */}
      <details className="text-xs text-gray-500">
        <summary>📄 Simple HTML File for App Source (if needed)</summary>
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
          <strong>Create a file called "index.html" and upload it:</strong>
          <pre className="mt-2 p-2 bg-white border rounded text-xs overflow-x-auto">
            {`<!DOCTYPE html>
<html>
<head>
    <title>Write Our Heart - Canva Integration</title>
</head>
<body>
    <h1>Write Our Heart</h1>
    <p>Canva integration for personalized greeting cards</p>
    <script>
        console.log('Write Our Heart Canva App Loaded');
    </script>
</body>
</html>`}
          </pre>
        </div>
      </details>

      {/* Debug Info */}
      <details className="text-xs text-gray-500">
        <summary>🔧 Debug Info & Current Status</summary>
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs whitespace-pre-line">
          {debugInfo}
          <div className="mt-2 pt-2 border-t">
            <strong>Generated Auth URL:</strong>
            <div className="mt-1 p-2 bg-white border rounded text-xs break-all">{authUrl || "Not generated"}</div>
            {authUrl && (
              <Button onClick={copyAuthUrl} variant="outline" size="sm" className="mt-1 bg-transparent">
                <Copy className="w-3 h-3 mr-1" />
                Copy Auth URL
              </Button>
            )}
          </div>
        </div>
      </details>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {isAuthorized ? (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600">Canva Connected ✅</span>
          <Button onClick={handleDisconnect} variant="outline" size="sm">
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Button
            onClick={handleAuth}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
            disabled={isLoading || !authUrl}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            {isLoading ? "Connecting..." : "Connect to Canva"}
          </Button>

          {/* Manual URL option */}
          {authUrl && !isLoading && (
            <div className="text-xs text-gray-600">
              <p>Or try opening the auth URL manually:</p>
              <Button onClick={() => window.open(authUrl, "_blank")} variant="outline" size="sm" className="mt-1">
                Open Auth URL in New Tab
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Recommendation */}
      <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded">
        <strong>💡 My Recommendation:</strong>
        <div className="mt-1 space-y-1">
          <div>1. Skip the OAuth Provider section (you don't need user login)</div>
          <div>2. Go straight to "App listing details"</div>
          <div>3. Fill out your app information</div>
          <div>4. Submit for review</div>
          <div>5. Use the Client ID/Secret Canva gives you</div>
          <div>6. This is simpler and matches what you actually need</div>
        </div>
      </div>

      {/* Alternative Approach */}
      <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded">
        <strong>🔄 Alternative: Use Bannerbear Instead</strong>
        <div className="mt-1 space-y-1">
          <div>While waiting for Canva approval, consider Bannerbear:</div>
          <div>• Instant setup, no approval needed</div>
          <div>• Perfect for automated card generation</div>
          <div>• $49/month for 1000 cards</div>
          <div>• Works exactly like you need</div>
        </div>
      </div>
    </div>
  )
}
