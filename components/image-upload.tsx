"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Eye } from "lucide-react"

interface ImageUploadProps {
  onImageUpload: (file: File, url: string) => void
  currentImage?: string
  title?: string
  description?: string
}

export function ImageUpload({ onImageUpload, currentImage, title, description }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Call parent callback
    onImageUpload(file, url)
  }

  const removeImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="font-semibold text-black">{title}</h3>}
      {description && <p className="text-sm text-gray-600">{description}</p>}

      <Card
        className={`border-2 border-dashed transition-colors ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
      >
        <CardContent className="p-6">
          {previewUrl ? (
            // Image Preview
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Uploaded artwork"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button onClick={removeImage} variant="destructive" size="sm" className="absolute top-2 right-2">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={openFileDialog} variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Upload className="w-4 h-4 mr-2" />
                  Replace Image
                </Button>
                <Button onClick={() => window.open(previewUrl, "_blank")} variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            // Upload Area
            <div
              className="text-center py-8 cursor-pointer"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-2">Upload Midjourney Artwork</p>
              <p className="text-sm text-gray-500 mb-4">Drag and drop your enhanced image here, or click to browse</p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>• Minimum 1500 x 2100 pixels (300 DPI for 5x7 inches)</p>
                <p>• PNG, JPG, or JPEG format</p>
                <p>• Maximum file size: 10MB</p>
              </div>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
        </CardContent>
      </Card>
    </div>
  )
}
