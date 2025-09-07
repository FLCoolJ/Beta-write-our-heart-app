"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, ArrowLeft, Mail, Lock, User, Gift, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  })

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const next = searchParams.get("next")
      if (session) {
        router.push(next || "/dashboard")
      }
    }
    checkSession()

    const ref = searchParams.get("ref")
    if (ref) {
      setReferralCode(ref)
    }
  }, [])

  const handleSignUpChange = (field: string, value: string) => {
    setSignUpData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
    if (success) setSuccess("")
  }

  const handleSignInChange = (field: string, value: string) => {
    setSignInData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
    if (success) setSuccess("")
  }

  const validateSignUp = () => {
    if (
      !signUpData.firstName ||
      !signUpData.lastName ||
      !signUpData.email ||
      !signUpData.password ||
      !signUpData.confirmPassword
    ) {
      setError("Please fill in all required fields")
      return false
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setError("Passwords don't match")
      return false
    }

    if (signUpData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }

    return true
  }

  const validateSignIn = () => {
    if (!signInData.email || !signInData.password) {
      setError("Please fill in all required fields")
      return false
    }
    return true
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Sign up form submitted")

    if (!validateSignUp()) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      console.log("[v0] Starting signup with hCaptcha...")

      // Execute hCaptcha
      const token = await (window as any).hcaptcha.execute("1deae092-5492-4c8a-94f4-1f86ae6c28ec", { async: true })

      if (!token) {
        setError("Please complete the security verification")
        return
      }

      const { error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: signUpData.firstName,
            last_name: signUpData.lastName,
          },
        },
      })

      if (error) {
        console.error("[v0] Signup error:", error)
        setError(error.message)
        return
      }

      console.log("[v0] Signup successful")
      router.push("/check-your-email")
    } catch (error) {
      console.error("[v0] Auth error:", error)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Sign in form submitted")

    if (!validateSignIn()) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      console.log("[v0] Starting login process...")

      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      })

      if (error) {
        console.error("[v0] Login error:", error)
        setError(error.message)
        return
      }

      console.log("[v0] Login successful")
      const next = searchParams.get("next")
      router.push(next || "/plans")
    } catch (error) {
      console.error("[v0] Auth error:", error)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-yellow-600">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <img src="/new-logo-symbol.png" alt="Write Our Heart" className="h-8 w-8" />
              <span className="font-bold text-yellow-600">Write Our Heart</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {referralCode && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Referral Bonus!</span>
            </div>
            <p className="text-sm text-green-700">
              You and your friend will both get 2 free cards when you complete signup!
            </p>
          </div>
        )}

        <p id="auth-error" style={{ color: "#c00" }}>
          {error}
        </p>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Sign Up Section */}
          <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Sign Up</CardTitle>
              <div className="flex justify-center gap-2 mt-4">
                <Badge className="bg-yellow-500 text-black">Beta Program</Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Lifetime Pricing
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form id="signupForm" onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={signUpData.firstName}
                        onChange={(e) => handleSignUpChange("firstName", e.target.value)}
                        className="pl-10 border-yellow-200 focus:border-yellow-400"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={signUpData.lastName}
                        onChange={(e) => handleSignUpChange("lastName", e.target.value)}
                        className="pl-10 border-yellow-200 focus:border-yellow-400"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={signUpData.email}
                      onChange={(e) => handleSignUpChange("email", e.target.value)}
                      className="pl-10 border-yellow-200 focus:border-yellow-400"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.password}
                      onChange={(e) => handleSignUpChange("password", e.target.value)}
                      className="pl-10 border-yellow-200 focus:border-yellow-400"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.confirmPassword}
                      onChange={(e) => handleSignUpChange("confirmPassword", e.target.value)}
                      className="pl-10 border-yellow-200 focus:border-yellow-400"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Beta Program Benefits:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Lock in lifetime pricing</li>
                  <li>• Priority customer support</li>
                  <li>• Early access to new features</li>
                  {referralCode && <li>• 2 free cards from referral bonus!</li>}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Sign In Section */}
          <Card className="bg-white/80 backdrop-blur-sm border border-yellow-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Sign In</CardTitle>
              <p className="text-gray-600 mt-2">Welcome back to Write Our Heart</p>
            </CardHeader>
            <CardContent>
              <form id="signinForm" onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="emailLogin">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="emailLogin"
                      type="email"
                      placeholder="your@email.com"
                      value={signInData.email}
                      onChange={(e) => handleSignInChange("email", e.target.value)}
                      className="pl-10 border-yellow-200 focus:border-yellow-400"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="passwordLogin">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="passwordLogin"
                      type="password"
                      placeholder="••••••••"
                      value={signInData.password}
                      onChange={(e) => handleSignInChange("password", e.target.value)}
                      className="pl-10 border-yellow-200 focus:border-yellow-400"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Forgot your password?{" "}
                  <Link href="/reset-password" className="text-blue-600 hover:text-blue-700 font-medium">
                    Reset it here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div
          dangerouslySetInnerHTML={{
            __html: `
              <!-- Supabase SDK + hCaptcha loader -->
              <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
              <script src="https://js.hcaptcha.com/1/api.js" async defer></script>
              <!-- Invisible hCaptcha widget -->
              <div class="h-captcha" data-sitekey="1deae092-5492-4c8a-94f4-1f86ae6c28ec" data-size="invisible"></div>
              
              <script>
                const SUPABASE_URL = "https://cloyucntnunxptefkhnr.supabase.co";
                const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsb3l1Y250bnVueHB0ZWZraG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTg2MDIsImV4cCI6MjA3MjY3NDYwMn0.L8fq9-mqJx2Xk_BEOk0wk9voGCXgp5oRvvJT3gtx2Sg";
                const HCAPTCHA_SITE_KEY = "1deae092-5492-4c8a-94f4-1f86ae6c28ec";

                const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

                function getNextParam() {
                  const u = new URL(window.location.href);
                  return u.searchParams.get('next') || '/plans';
                }

                function showError(err) {
                  const msg = typeof err === 'string' ? err : (err?.message || 'Unexpected error');
                  const el = document.getElementById('auth-error');
                  if (el) el.textContent = msg;
                  console.error(msg, err);
                }

                async function getCaptchaToken() {
                  // wait until widget is rendered
                  await new Promise((resolve) => {
                    if (window.hcaptcha && document.querySelector('.h-captcha')) return resolve();
                    const t = setInterval(() => {
                      if (window.hcaptcha && document.querySelector('.h-captcha')) {
                        clearInterval(t); resolve();
                      }
                    }, 100);
                  });
                  // get a fresh token every submit
                  return await window.hcaptcha.execute(HCAPTCHA_SITE_KEY, { async: true });
                }

                function isAlreadyRegistered(error) {
                  const m = (error?.message || "").toLowerCase();
                  return m.includes("already registered") || m.includes("user already exists") || m.includes("duplicate key");
                }

                function isCaptchaError(error) {
                  return /captcha/i.test(error?.message || "");
                }

                async function handleSignUp(e) {
                  e.preventDefault();
                  const first = document.getElementById('firstName')?.value?.trim();
                  const last  = document.getElementById('lastName')?.value?.trim();
                  const email = document.getElementById('email')?.value?.trim();
                  const pass  = document.getElementById('password')?.value;
                  const confirm = document.getElementById('confirm')?.value;

                  if (!email || !pass) return showError('Email and password are required.');
                  if (pass !== confirm) return showError('Passwords do not match.');

                  try {
                    const captchaToken = await getCaptchaToken();
                    if (!captchaToken) return showError('Captcha token missing.');

                    const next = getNextParam();
                    const { error } = await supabase.auth.signUp({
                      email,
                      password: pass,
                      options: {
                        emailRedirectTo: \`\${window.location.origin}/auth/callback?next=\${encodeURIComponent(next)}\`,
                        data: { first_name: first, last_name: last },
                        captchaToken
                      }
                    });

                    if (error) {
                      if (isAlreadyRegistered(error)) {
                        // gentle nudge to sign in instead
                        const signInEmail = document.getElementById('emailLogin');
                        if (signInEmail) signInEmail.value = email;
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        return showError('That email is already registered. Please sign in.');
                      }
                      if (isCaptchaError(error)) {
                        return showError('Captcha failed. Please try again.');
                      }
                      return showError(error);
                    }

                    window.location.assign('/check-your-email');
                  } catch (err) {
                    showError(err);
                  }
                }

                async function handleSignIn(e) {
                  e.preventDefault();
                  const email = document.getElementById('emailLogin')?.value?.trim();
                  const pass  = document.getElementById('passwordLogin')?.value;
                  const next = getNextParam();
                  try {
                    let { error } = await supabase.auth.signInWithPassword({ email, password: pass });

                    // If Attack Protection challenges sign-in, retry with token
                    if (error && isCaptchaError(error)) {
                      const token = await getCaptchaToken();
                      const res = await supabase.auth.signInWithPassword({
                        email, password: pass, options: { captchaToken: token }
                      });
                      error = res.error;
                    }
                    if (error) return showError(error);

                    window.location.assign(next);
                  } catch (err) {
                    showError(err);
                  }
                }

                document.getElementById('signupForm')?.addEventListener('submit', handleSignUp);
                document.getElementById('signinForm')?.addEventListener('submit', handleSignIn);
              </script>
            `,
          }}
        />
      </div>
    </div>
  )
}
