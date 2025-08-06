"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Download, Upload, CheckCircle, AlertCircle } from "lucide-react"

export default function CSVUploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<any>(null)

  const downloadTemplate = () => {
    const csvContent = `Name,Relationship,Current Age,Address,City,State,ZIP Code,Phone,Email,Tone,Occasions,Special Notes
John Smith,Father,65,123 Main St,Springfield,IL,62701,(555) 123-4567,john@email.com,warm,"Birthday,Christmas","Loves fishing and golf. Always tells dad jokes."
Mary Johnson,Mother,62,456 Oak Ave,Chicago,IL,60601,(555) 987-6543,mary@email.com,heartfelt,"Mother's Day,Birthday","Amazing cook. Loves gardening and her grandchildren."
Sarah Wilson,Friend,35,789 Pine Rd,Austin,TX,73301,(555) 456-7890,sarah@email.com,playful,"Birthday,Thank You","Always there when you need her. Loves coffee and adventure travel."`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "hearts_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
    } else {
      alert("Please select a valid CSV file")
    }
  }

  const processCSV = async () => {
    if (!file) return

    setIsProcessing(true)
    const text = await file.text()
    const lines = text.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())

    const processedHearts = []
    const errors = []

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim())

        if (values.length < headers.length) continue

        const heart = {
          id: Date.now().toString() + i,
          name: values[0],
          relationship: values[1],
          currentAge: values[2],
          address: values[3],
          city: values[4],
          state: values[5],
          zipCode: values[6],
          phone: values[7],
          email: values[8],
          tone: values[9] || "warm",
          occasions: values[10] ? values[10].split(";") : [],
          notes: values[11] || "",
          createdAt: new Date().toISOString(),
          status: "active",
        }

        if (!heart.name || !heart.relationship || !heart.address) {
          errors.push(`Row ${i + 1}: Missing required fields (Name, Relationship, Address)`)
          continue
        }

        processedHearts.push(heart)
      } catch (error) {
        errors.push(`Row ${i + 1}: Error processing row`)
      }
    }

    // Save to localStorage
    const userData = JSON.parse(localStorage.getItem("currentUser") || "{}")
    userData.hearts = [...(userData.hearts || []), ...processedHearts]
    localStorage.setItem("currentUser", JSON.stringify(userData))
    localStorage.setItem("user", JSON.stringify(userData))

    setResults({
      success: processedHearts.length,
      errors: errors.length,
      errorDetails: errors,
    })
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <Upload className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">Upload Hearts via CSV</h1>
            <p className="text-gray-600">Upload multiple recipients at once using a CSV file</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>CSV Upload Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Download Template */}
            <div className="space-y-3">
              <h3 className="font-semibold text-black">Step 1: Download Template</h3>
              <p className="text-sm text-gray-600">
                Download our CSV template with example data to see the required format.
              </p>
              <Button onClick={downloadTemplate} variant="outline" className="w-full bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
            </div>

            {/* Step 2: Upload File */}
            <div className="space-y-3">
              <h3 className="font-semibold text-black">Step 2: Upload Your CSV</h3>
              <p className="text-sm text-gray-600">
                Fill out the template with your recipients' information and upload it here.
              </p>
              <div className="space-y-2">
                <Label htmlFor="csvFile">Select CSV File</Label>
                <Input id="csvFile" type="file" accept=".csv" onChange={handleFileChange} />
              </div>

              {file && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <strong>Selected file:</strong> {file.name}
                  </p>
                </div>
              )}
            </div>

            {/* Step 3: Process */}
            <div className="space-y-3">
              <h3 className="font-semibold text-black">Step 3: Process Upload</h3>
              <Button
                onClick={processCSV}
                disabled={!file || isProcessing}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                {isProcessing ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Processing CSV...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Process CSV Upload
                  </>
                )}
              </Button>
            </div>

            {/* Results */}
            {results && (
              <div className="space-y-3">
                <h3 className="font-semibold text-black">Upload Results</h3>

                {results.success > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">
                        ✅ Successfully imported {results.success} hearts
                      </span>
                    </div>
                  </div>
                )}

                {results.errors > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-800">❌ {results.errors} rows had errors</span>
                    </div>
                    <div className="text-sm text-red-700 space-y-1">
                      {results.errorDetails.map((error: string, index: number) => (
                        <p key={index}>• {error}</p>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => router.push("/my-hearts")}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Go to My Hearts Dashboard
                </Button>
              </div>
            )}

            {/* CSV Format Guide */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-black mb-2">CSV Format Requirements:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • <strong>Required fields:</strong> Name, Relationship, Address, City, State
                </li>
                <li>
                  • <strong>Occasions:</strong> Separate multiple occasions with semicolons (;)
                </li>
                <li>
                  • <strong>Tone options:</strong> warm, playful, formal, heartfelt, humorous, inspirational
                </li>
                <li>
                  • <strong>Special Notes:</strong> Include personal details for better card personalization
                </li>
                <li>
                  • <strong>File format:</strong> Must be a .csv file
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
