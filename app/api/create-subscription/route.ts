// Example: components/PlanSelection.jsx
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

export default function PlanSelection({ userId, email }) {
  const subscribeToPlan = async (priceId) => {
    const response = await fetch("/api/create-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, priceId, userId }),
    });
    const { clientSecret } = await response.json();
    // Handle the clientSecret to complete the Stripe subscription flow
  };

  return (
    <div>
      {plans.map((plan) => (
        <div key={plan.name}>
          <h2>{plan.name}</h2>
          <p>Price: {plan.price} (Launch: {plan.launchPrice})</p>
          <ul>
            {plan.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <button onClick={() => subscribeToPlan(plan.stripePriceId)}>
            Choose {plan.name}
          </button>
        </div>
      ))}
    </div>
  );
}
