// app/pricing/page.tsx
"use client"; // Mark this as a client component

import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const plans = [
  {
    name: "Whisper",
    price: "$8.99/month",
    launchPrice: "$11.99/month",
    features: [
      "2 Premium cards per month",
      "US Postage included",
      "Personalized poetry",
      "Occasion reminders",
      "Cards expire after 2 months",
      "Additional cards: $4.99 each",
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_WHISPER_PRICE_ID, // Pass the Price ID from env
  },
  {
    name: "Legacy",
    price: "$25.99/month",
    launchPrice: "$34.99/month",
    features: [
      "7 Premium cards per month",
      "US Postage included",
      "Personalized poetry",
      "Occasion reminders",
      "Priority customer support",
      "Cards expire after 2 months",
      "Additional cards: $4.99 each",
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_LEGACY_PRICE_ID, // Pass the Price ID from env
  },
];

export default function PricingPage({ user }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (priceId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          priceId,
          userId: user.id,
        }),
      });

      const { clientSecret } = await response.json();
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      const { error } = await stripe!.redirectToCheckout({ clientSecret });

      if (error) {
        console.error("Error:", error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Choose Your Plan</h1>
      <div className="plans">
        {plans.map((plan) => (
          <div key={plan.name} className="plan">
            <h2>{plan.name}</h2>
            <p>Price: {plan.price} (Launch: {plan.launchPrice})</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <button onClick={() => handleSubscribe(plan.stripePriceId!)} disabled={loading}>
              {loading ? "Processing..." : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
