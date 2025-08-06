"use client"

import { Heart, Mail, PenTool } from "lucide-react"

export function LogoVariations() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Write Our Heart - Logo Concepts</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Current Style */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-8 rounded-lg text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-yellow-500" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold text-black">Write Our Heart</h2>
            <p className="text-black/80">Current Design</p>
          </div>

          {/* Elegant Script */}
          <div className="bg-gradient-to-br from-yellow-300 to-amber-500 p-8 rounded-lg text-center">
            <div className="mb-4">
              <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "cursive" }}>
                Wr
                <Heart className="w-6 h-6 inline text-white" fill="currentColor" />
                te
              </h2>
              <h3 className="text-xl font-semibold text-white">Our Heart</h3>
            </div>
            <p className="text-white/90">Script + Heart</p>
          </div>

          {/* Card Envelope */}
          <div className="bg-gradient-to-br from-amber-400 to-yellow-600 p-8 rounded-lg text-center">
            <div className="w-20 h-16 mx-auto mb-4 bg-white rounded-sm flex items-center justify-center relative">
              <Mail className="w-8 h-8 text-amber-500" />
              <Heart className="w-4 h-4 text-red-500 absolute -top-1 -right-1" fill="currentColor" />
            </div>
            <h2 className="text-xl font-bold text-white">Write Our Heart</h2>
            <p className="text-white/90">Envelope Style</p>
          </div>

          {/* Minimalist */}
          <div className="bg-white border-4 border-yellow-400 p-8 rounded-lg text-center">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-yellow-600">Write Our</h2>
              <div className="flex items-center justify-center gap-1">
                <Heart className="w-6 h-6 text-red-500" fill="currentColor" />
                <span className="text-2xl font-bold text-gray-800">Heart</span>
              </div>
            </div>
            <p className="text-gray-600">Minimalist</p>
          </div>

          {/* Handwritten */}
          <div className="bg-gradient-to-br from-yellow-200 to-yellow-400 p-8 rounded-lg text-center">
            <div className="mb-4">
              <PenTool className="w-8 h-8 mx-auto text-gray-700 mb-2" />
              <h2 className="text-2xl text-gray-800" style={{ fontFamily: "cursive" }}>
                Write Our Heart
              </h2>
            </div>
            <p className="text-gray-700">Handwritten</p>
          </div>

          {/* Professional */}
          <div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-8 rounded-lg text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs font-bold text-yellow-600">WOH</div>
                <Heart className="w-4 h-4 text-red-500 mx-auto" fill="currentColor" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-white">Write Our Heart</h2>
            <p className="text-white/90">Professional</p>
          </div>
        </div>

        {/* Color Palette */}
        <div className="mt-12 bg-white rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Current Color Palette</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Primary Yellow</p>
              <p className="text-xs text-gray-500">#FDE047</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-600 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Deep Gold</p>
              <p className="text-xs text-gray-500">#F59E0B</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Accent Purple</p>
              <p className="text-xs text-gray-500">#7C3AED</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Clean White</p>
              <p className="text-xs text-gray-500">#FFFFFF</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-3">🎨 Logo Recommendations</h3>
          <ul className="space-y-2 text-yellow-700">
            <li>
              <strong>Best for Brand Recognition:</strong> Keep the circular white background with heart icon
            </li>
            <li>
              <strong>Typography:</strong> Use a warm, friendly sans-serif font
            </li>
            <li>
              <strong>Colors:</strong> Primary yellow (#FDE047) with deep gold (#F59E0B) accents
            </li>
            <li>
              <strong>Icon:</strong> Heart should be filled, not outlined, for better visibility
            </li>
            <li>
              <strong>Scalability:</strong> Ensure it works at small sizes (favicon, mobile)
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
