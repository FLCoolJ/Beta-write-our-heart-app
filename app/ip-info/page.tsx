"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, RefreshCw } from "lucide-react"

interface IPInfo {
  ipSources: Record<string, string | null>
  externalIp: string | null
  timestamp: string
  vercelRegion: string
}

export default function IPInfoPage() {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const fetchIPInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/get-vercel-ip")
      const data = await response.json()
      setIpInfo(data)
    } catch (error) {
      console.error("Failed to fetch IP info:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIPInfo()
  }, [])

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vercel Deployment IP Information</h1>
          <p className="text-gray-600">Use these IP addresses to configure Brevo API access</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Deployment IPs</CardTitle>
                <CardDescription>Add these IP addresses to your Brevo account settings</CardDescription>
              </div>
              <Button onClick={fetchIPInfo} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {ipInfo ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(ipInfo.ipSources).map(([source, ip]) => (
                    <div key={source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{source}</p>
                        <p className="text-sm text-gray-600 font-mono">{ip || "Not available"}</p>
                      </div>
                      {ip && (
                        <Button onClick={() => copyToClipboard(ip, source)} variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                          {copied === source ? "Copied!" : "Copy"}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {ipInfo.externalIp && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-yellow-800">External IP (Most Important)</p>
                        <p className="text-lg font-mono text-yellow-900">{ipInfo.externalIp}</p>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(ipInfo.externalIp!, "external")}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {copied === "external" ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Badge variant="secondary">Region: {ipInfo.vercelRegion}</Badge>
                  <span>Last updated: {new Date(ipInfo.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading IP information...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Configure Brevo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Step 1: Log into Brevo</h3>
                <p className="text-blue-800 text-sm">Go to your Brevo dashboard and log in</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Step 2: Find IP Settings</h3>
                <p className="text-blue-800 text-sm">
                  Navigate to: Account Settings → Security → IP Authorization (or API Keys → IP Restrictions)
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Step 3: Add IP Addresses</h3>
                <p className="text-blue-800 text-sm">
                  Add the External IP address shown above, or disable IP restrictions entirely
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Alternative: Use Email Link</h3>
                <p className="text-green-800 text-sm">
                  Click "authorize this new IP address" in the email Brevo sent you
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
