"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Download, AlertCircle, CheckCircle } from "lucide-react"

interface CsvUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: (hearts: any[]) => void
}

export function CsvUploadModal({ isOpen, onClose, onUploadComplete }: CsvUploadModalProps) {
  const [dragActive, setDragActive] = useState(false)
  const [csvData, setCsvData] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [step, setStep] = useState<"upload" | "preview">("upload")

  if (!isOpen) return null

  const downloadTemplate = () => {
    const template = `Name,Relationship,Email,Phone,Age,Address,City,State,ZipCode,Occasions,OccasionDates
John Doe,Friend,john@email.com,555-1234,30,123 Main St,Anytown,CA,12345,Birthday|Anniversary,2024-03-15|2024-06-20
Jane Smith,Sister,jane@email.com,555-5678,28,456 Oak Ave,Somewhere,NY,67890,Birthday,2024-05-10`

    const blob = new Blob([template], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "hearts-template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length < 2) {
      setErrors(["CSV file must contain at least a header row and one data row"])
      return []
    }

    const headers = lines[0].split(",").map((h) => h.trim())
    const requiredHeaders = ["Name", "Relationship", "Occasions"]
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

    if (missingHeaders.length > 0) {
      setErrors([`Missing required columns: ${missingHeaders.join(", ")}`])
      return []
    }

    const hearts: any[] = []
    const parseErrors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      if (values.length !== headers.length) {
        parseErrors.push(`Row ${i + 1}: Column count mismatch`)
        continue
      }

      const heart: any = { id: Date.now() + Math.random() }

      headers.forEach((header, index) => {
        const value = values[index]

        switch (header) {
          case "Name":
            heart.name = value
            break
          case "Relationship":
            heart.relationship = value
            break
          case "Email":
            heart.email = value || undefined
            break
          case "Phone":
            heart.phone = value || undefined
            break
          case "Age":
            heart.age = value ? Number.parseInt(value) : undefined
            break
          case "Address":
            heart.address = value || undefined
            break
          case "City":
            heart.city = value || undefined
            break
          case "State":
            heart.state = value || undefined
            break
          case "ZipCode":
            heart.zipCode = value || undefined
            break
          case "Occasions":
            heart.occasions = value ? value.split("|").map((o) => o.trim()) : []
            break
          case "OccasionDates":
            if (value) {
              const dates = value.split("|").map((d) => d.trim())
              heart.occasionDates = {}
              heart.occasions?.forEach((occasion: string, idx: number) => {
                if (dates[idx]) {
                  heart.occasionDates[occasion] = dates[idx]
                }
              })
            }
            break
        }
      })

      if (!heart.name || !heart.relationship || !heart.occasions?.length) {
        parseErrors.push(`Row ${i + 1}: Missing required fields (Name, Relationship, or Occasions)`)
        continue
      }

      hearts.push(heart)
    }

    if (parseErrors.length > 0) {
      setErrors(parseErrors)
    }

    return hearts
  }

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setErrors(["Please upload a CSV file"])
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.length > 0) {
        setCsvData(parsed)
        setStep("preview")
        setErrors([])
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleImport = () => {
    onUploadComplete(csvData)
    onClose()
    setStep("upload")
    setCsvData([])
    setErrors([])
  }

  const resetUpload = () => {
    setStep("upload")
    setCsvData([])
    setErrors([])
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Import Hearts from CSV</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {step === "upload" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Upload a CSV file to import multiple hearts at once</p>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-yellow-500 bg-yellow-50" : "border-gray-300"
              }`}
              onDragEnter={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setDragActive(false)
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">Drop your CSV file here, or click to browse</p>
              <p className="text-sm text-gray-500 mb-4">
                Supports CSV files with Name, Relationship, and Occasions columns
              </p>
              <input type="file" accept=".csv" onChange={handleFileInput} className="hidden" id="csv-upload" />
              <label htmlFor="csv-upload">
                <Button variant="outline" className="cursor-pointer">
                  Choose File
                </Button>
              </label>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800">Upload Errors:</span>
                </div>
                <ul className="list-disc list-inside text-sm text-red-700">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">Ready to import {csvData.length} hearts</span>
              </div>
              <Button variant="outline" size="sm" onClick={resetUpload}>
                Upload Different File
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <div className="grid gap-4 p-4">
                {csvData.slice(0, 10).map((heart, index) => (
                  <Card key={index} className="border-l-4 border-l-yellow-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{heart.name}</CardTitle>
                      <p className="text-sm text-gray-600">{heart.relationship}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {heart.email && <p className="text-sm text-gray-600">📧 {heart.email}</p>}
                        {heart.phone && <p className="text-sm text-gray-600">📞 {heart.phone}</p>}
                        {heart.address && (
                          <p className="text-sm text-gray-600">
                            📍 {heart.address}, {heart.city}, {heart.state} {heart.zipCode}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {heart.occasions?.map((occasion: string) => (
                            <Badge key={occasion} variant="secondary" className="text-xs">
                              {occasion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {csvData.length > 10 && (
                  <p className="text-center text-gray-500 text-sm">... and {csvData.length - 10} more hearts</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetUpload}>
                Cancel
              </Button>
              <Button onClick={handleImport} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                Import {csvData.length} Hearts
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
