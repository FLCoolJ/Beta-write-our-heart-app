import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-yellow-500 mb-4" />
        <p className="text-gray-600">Loading verification page...</p>
      </div>
    </div>
  )
}
