"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

interface OccasionAutocompleteProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
}

export function OccasionAutocomplete({
  value,
  onChange,
  suggestions = [], // Add default empty array
  placeholder = "Type occasion name...",
}: OccasionAutocompleteProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue)

    if (inputValue.length > 0 && suggestions && Array.isArray(suggestions)) {
      const filtered = suggestions.filter(
        (suggestion) => suggestion && suggestion.toLowerCase().includes(inputValue.toLowerCase()),
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
      setFilteredSuggestions([])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (value && filteredSuggestions.length > 0) {
            setShowSuggestions(true)
          }
        }}
        onBlur={() => {
          // Delay hiding to allow click on suggestions
          setTimeout(() => setShowSuggestions(false), 200)
        }}
        className="text-sm"
      />

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              onClick={() => handleSuggestionClick(suggestion)}
              aria-label={`Select ${suggestion} as occasion`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
