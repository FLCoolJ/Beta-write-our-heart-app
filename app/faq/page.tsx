"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, CreditCard, Phone, Clock, Users, AlertTriangle, Mail } from "lucide-react"

export default function FAQ() {
  const handleSupportClick = (section: string) => {
    // Redirect to your website's FAQ page with anchor links
    const baseUrl = "https://www.writeourheart.com/FAQ"
    let anchor = ""

    switch (section) {
      case "Payment Security":
        anchor = "#payment-security"
        break
      case "Data Protection":
        anchor = "#data-protection"
        break
      case "Privacy Policy":
        anchor = "#privacy-policy"
        break
      case "SSL Certification":
        anchor = "#ssl-certification"
        break
      case "USPS Validated":
        anchor = "#usps-validation"
        break
      default:
        anchor = ""
    }

    window.open(`${baseUrl}${anchor}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md p-2">
              <img src="/logo.png" alt="Write Our Heart" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black">Frequently Asked Questions</h1>
              <p className="text-gray-600">Everything you need to know about Write Our Heart</p>
            </div>
          </div>

          {/* Beta Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-yellow-500 text-black">🚀 Beta Pricing - Limited Time</Badge>
            </div>
            <p className="text-sm text-yellow-800">
              <strong>Lock in beta rates now!</strong> Beta users who maintain continuous active subscriptions with
              verified email will keep their beta pricing for 12 months after launch.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Pricing & Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <CreditCard className="w-5 h-5" />
              Pricing & Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-black">Beta Pricing (Current - Limited Time)</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Standard:</strong> $5.99/month (4 cards = $1.50 each) - 40% off launch price
                  </li>
                  <li>
                    <strong>Enterprise:</strong> $23.99/month (10 cards = $2.40 each) - 20% off launch price
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-black">Launch Pricing (Full Service)</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Standard:</strong> $9.99/month (4 cards + international shipping)
                  </li>
                  <li>
                    <strong>Enterprise:</strong> $29.99/month (10 cards + international shipping)
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">How Card Credits Work:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Cards are distributed weekly (not all at once)</li>
                <li>• Standard: 1 card per week, Enterprise: 2-3 cards per week</li>
                <li>• Cards are deducted when mailed, not when occasions are selected</li>
                <li>• Additional cards: $4.99 per card after using monthly allotment</li>
                <li>
                  • <strong>Early cancellation fee:</strong> 50% of monthly fee if &gt;75% cards used before canceling
                </li>
                <li>• Standard fee: $3.00, Enterprise fee: $12.00</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Card Credits & Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Clock className="w-5 h-5" />
              Card Credits & Expiration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-black mb-2">How many cards can I send?</h4>
                <p className="text-sm text-gray-600">
                  Standard plans get 4 cards per month, Enterprise gets 10 cards per month. Cards are distributed weekly
                  to prevent abuse.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-black mb-2">When are cards deducted from my account?</h4>
                <p className="text-sm text-gray-600">
                  Cards are only deducted when they are physically mailed out, not when you schedule them or select
                  occasions.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-black mb-2">Do card credits expire?</h4>
                <p className="text-sm text-gray-600">
                  <strong>Yes, unused credits expire after 3 months.</strong> This prevents abuse where users consume
                  all cards immediately then cancel, which would be unsustainable for our service. Schedule cards in
                  advance to avoid expiration.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-black mb-2">What's the recipient address limit?</h4>
                <p className="text-sm text-gray-600">
                  Maximum 3 cards per recipient address per month (across all accounts). This prevents spam and ensures
                  quality service. You'll see a warning when approaching this limit.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-black mb-2">How much do additional cards cost?</h4>
                <p className="text-sm text-gray-600">
                  Additional cards beyond your monthly subscription are $4.99 per card. You can purchase them as needed
                  through your dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Shield className="w-5 h-5" />
              Account Security & Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-black">Security Features</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    Phone verification required
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-green-600" />
                    Email verification required quarterly
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    One account per billing address
                  </li>
                  <li className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-green-600" />
                    Payment method verification required
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-black">Fraud Prevention</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• USPS address validation for all addresses</li>
                  <li>• IP address tracking and monitoring</li>
                  <li>• Usage analytics to detect unusual patterns</li>
                  <li>• Account sharing violations result in suspension</li>
                  <li>• SSL encryption for all data</li>
                </ul>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">Important Security Policy:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>
                  • <strong>One account per billing address</strong> - Subject to address validation and usage
                  monitoring
                </li>
                <li>
                  • <strong>All addresses are validated through USPS API</strong> before printing
                </li>
                <li>
                  • <strong>Email verification required quarterly</strong> and when suspicious activity is detected
                </li>
                <li>
                  • <strong>Beta pricing requires continuous active subscription</strong> with verified email
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Enterprise Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Users className="w-5 h-5" />
              Enterprise Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">Enterprise Account Requirements:</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Individual logins for each team member</li>
                <li>• Usage analytics and reporting</li>
                <li>• Team size verification required</li>
                <li>• 30-word minimum for messages (vs 50 for standard)</li>
                <li>• Account sharing violations result in suspension</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-black mb-2">Can I share my account?</h4>
                <p className="text-sm text-gray-600">
                  No, account sharing is not permitted. Enterprise accounts require individual logins for each team
                  member to ensure proper usage tracking and security.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-black mb-2">How do you define "team size"?</h4>
                <p className="text-sm text-gray-600">
                  Team size is verified during signup and determines your card allocation. Each team member needs their
                  own login credentials.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation & Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <AlertTriangle className="w-5 h-5" />
              Cancellation & Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-black mb-2">What happens if I cancel?</h4>
                <p className="text-sm text-gray-600">
                  You can cancel anytime. However, an early cancellation fee of 50% of your monthly fee applies if
                  you've used 75% or more of your monthly cards before canceling. This prevents abuse where users
                  consume all cards immediately then cancel.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-black mb-2">How do you prevent fraud?</h4>
                <p className="text-sm text-gray-600">
                  We use multiple security measures including phone verification, quarterly email verification, IP
                  tracking, payment method validation, USPS address validation, and usage analytics to prevent
                  fraudulent activity.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-black mb-2">Beta vs Launch Pricing Protection</h4>
                <p className="text-sm text-gray-600">
                  Beta users who maintain continuous active subscriptions with verified email will keep their beta
                  pricing for 12 months after launch. No gaps in subscription allowed - even failed payments that exceed
                  our grace period will result in loss of beta pricing.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-black mb-2">What's the grace period for failed payments?</h4>
                <p className="text-sm text-gray-600">
                  We offer a 7-day initial grace period, followed by an additional 7 days of limited service (14 days
                  total). Accounts over 6 months get 21 days total, and accounts over 1 year get 30 days total. Beta
                  pricing protection remains intact if resolved within the grace period.
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">"Use It or Lose It" Policy:</h4>
              <p className="text-sm text-red-700">
                Card credits expire after 3 months (not 6) to encourage regular usage and prevent abuse. This policy
                prevents users from consuming all cards immediately then canceling, which would be unsustainable for our
                service.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Poetry & Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Poetry & Content Creation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-black mb-2">How is the poetry created?</h4>
              <p className="text-sm text-gray-600">
                Our system uses your personal message, selected tone, and recipient information to create beautiful,
                personalized poetry for your greeting cards.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-black mb-2">Can I save my writing for future use?</h4>
              <p className="text-sm text-gray-600">
                Yes! When your card is mailed, you'll receive an email with an option to save the writing for future
                cards.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Support */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Need More Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Can't find what you're looking for? Visit our comprehensive FAQ section or contact our support team at{" "}
              <a href="mailto:info@writeourheart.com" className="text-yellow-600 hover:text-yellow-700">
                info@writeourheart.com
              </a>
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSupportClick("Payment Security")}
                className="inline-block"
                aria-label="Learn more about payment security and protection"
              >
                <Badge variant="outline" className="hover:bg-gray-50 cursor-pointer transition-colors">
                  Payment Security
                </Badge>
              </button>
              <button
                onClick={() => handleSupportClick("Data Protection")}
                className="inline-block"
                aria-label="Learn more about data protection policies"
              >
                <Badge variant="outline" className="hover:bg-gray-50 cursor-pointer transition-colors">
                  Data Protection
                </Badge>
              </button>
              <button
                onClick={() => handleSupportClick("Privacy Policy")}
                className="inline-block"
                aria-label="Read our privacy policy and data handling practices"
              >
                <Badge variant="outline" className="hover:bg-gray-50 cursor-pointer transition-colors">
                  Privacy Policy
                </Badge>
              </button>
              <button
                onClick={() => handleSupportClick("SSL Certification")}
                className="inline-block"
                aria-label="Learn about our SSL certification and security measures"
              >
                <Badge variant="outline" className="hover:bg-gray-50 cursor-pointer transition-colors">
                  SSL Certification
                </Badge>
              </button>
              <button
                onClick={() => handleSupportClick("USPS Validated")}
                className="inline-block"
                aria-label="Learn about USPS address validation process"
              >
                <Badge variant="outline" className="hover:bg-gray-50 cursor-pointer transition-colors">
                  USPS Validated
                </Badge>
              </button>
            </div>
            <div className="mt-4 pt-4 border-t">
              <a
                href="https://www.writeourheart.com/FAQ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-yellow-600 hover:text-yellow-700 font-medium"
              >
                Visit Full FAQ Section →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
