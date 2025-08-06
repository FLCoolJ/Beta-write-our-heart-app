"use client"

import type React from "react"
import { useState } from "react"

interface PurchaseCardsModalProps {
  isOpen: boolean
  onClose: () => void
  onPurchase: (quantity: number) => void
}

const PurchaseCardsModal: React.FC<PurchaseCardsModalProps> = ({ isOpen, onClose, onPurchase }) => {
  const [quantity, setQuantity] = useState(1)

  if (!isOpen) {
    return null
  }

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value)
    if (!isNaN(value) && value > 0) {
      setQuantity(value)
    }
  }

  const handlePurchaseComplete = () => {
    // Update user's card balance
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}")
    const updatedUser = {
      ...currentUser,
      freeCards: (currentUser.freeCards || 0) + quantity,
      purchasedCards: (currentUser.purchasedCards || 0) + quantity,
    }

    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    localStorage.setItem("user", JSON.stringify(updatedUser))

    onPurchase(quantity)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Purchase Cards</h2>
        <p className="mb-4">How many cards would you like to purchase?</p>

        <div className="flex items-center mb-4">
          <label htmlFor="quantity" className="mr-2">
            Quantity:
          </label>
          <input
            type="number"
            id="quantity"
            className="border rounded py-2 px-3 w-20"
            value={quantity}
            onChange={handleQuantityChange}
            min="1"
          />
        </div>

        <div className="flex justify-end">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handlePurchaseComplete}
          >
            Purchase
          </button>
        </div>
      </div>
    </div>
  )
}

export { PurchaseCardsModal }
export default PurchaseCardsModal
