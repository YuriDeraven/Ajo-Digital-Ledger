"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react"

interface PaymentProofUploadProps {
  groupId: string
  memberId: string
  onUploadSuccess?: (fileName: string) => void
  onUploadError?: (error: string) => void
}

export function PaymentProofUpload({
  groupId,
  memberId,
  onUploadSuccess,
  onUploadError
}: PaymentProofUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
    if (!validTypes.includes(selectedFile.type)) {
      setUploadMessage("Please upload a valid image (JPG, PNG, GIF) or PDF file")
      setUploadStatus("error")
      return
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadMessage("File size must be less than 5MB")
      setUploadStatus("error")
      return
    }

    setFile(selectedFile)
    setUploadStatus("idle")
    setUploadMessage("")

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview("")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setUploadStatus("uploading")
      setUploadMessage("Uploading...")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("groupId", groupId)
      formData.append("memberId", memberId)

      const res = await fetch("/api/upload-proof", {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Upload failed")
      }

      const result = await res.json()
      setUploadStatus("success")
      setUploadMessage(`Successfully uploaded: ${result.fileName}`)
      setFile(null)
      setPreview("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      onUploadSuccess?.(result.fileName)
    } catch (error) {
      setUploadStatus("error")
      setUploadMessage(error instanceof Error ? error.message : "Upload failed")
      onUploadError?.(uploadMessage)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Proof</h3>

      {/* File Input */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,.pdf"
          className="hidden"
          disabled={uploading}
        />
        <Button
          variant="outline"
          className="w-full gap-2 border-dashed"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="w-4 h-4" />
          Choose File (Image or PDF)
        </Button>
        <p className="text-xs text-slate-500 mt-2">Max size: 5MB (JPG, PNG, GIF, PDF)</p>
      </div>

      {/* Preview */}
      {preview && (
        <div className="mb-4">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <img
              src={preview}
              alt="Preview"
              className="max-h-40 mx-auto rounded object-cover"
            />
          </div>
        </div>
      )}

      {/* File Name */}
      {file && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-sm text-slate-700 truncate">{file.name}</span>
          <button
            onClick={() => {
              setFile(null)
              setPreview("")
              if (fileInputRef.current) fileInputRef.current.value = ""
            }}
            disabled={uploading}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus === "success" && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200 flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{uploadMessage}</p>
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{uploadMessage}</p>
        </div>
      )}

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full"
      >
        {uploading ? "Uploading..." : "Upload Proof"}
      </Button>
    </Card>
  )
}
