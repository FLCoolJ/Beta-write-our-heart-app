"use client"
import { ArrowLeft, Heart } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-yellow-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/auth" className="flex items-center gap-2 text-gray-600 hover:text-yellow-600">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
            <div className="flex items-center gap-2">
              <img src="/new-logo-symbol.png" alt="Write Our Heart" className="h-8 w-8" />
              <span className="font-bold text-yellow-600">Write Our Heart</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white/80 backdrop-blur-sm border border-yellow-200 rounded-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          </div>

          <div
            dangerouslySetInnerHTML={{
              __html: `
                <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/dist/umd/supabase.js" defer></script>

                <div style="font-family:system-ui">
                  <p id="rp-msg" style="color:#555;margin:8px 0 16px"></p>

                  <!-- When arriving from the email link (has ?code=...), show new password form -->
                  <form id="rp-new" style="display:none" onsubmit="return false;">
                    <input id="rp-pass" type="password" placeholder="New password" required style="width:100%;padding:10px;margin:6px 0;border:1px solid #e5e7eb;border-radius:6px"/>
                    <input id="rp-pass2" type="password" placeholder="Confirm new password" required style="width:100%;padding:10px;margin:6px 0;border:1px solid #e5e7eb;border-radius:6px"/>
                    <button id="rp-save" type="button" style="width:100%;padding:10px;margin-top:8px;background:linear-gradient(to right, #60a5fa, #a855f7);color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer">Save password</button>
                  </form>

                  <!-- If user opened this page directly (no code), let them request a reset email -->
                  <form id="rp-request" style="display:none" onsubmit="return false;">
                    <input id="rp-email" type="email" placeholder="Email" required style="width:100%;padding:10px;margin:6px 0;border:1px solid #e5e7eb;border-radius:6px"/>
                    <button id="rp-send" type="button" style="width:100%;padding:10px;margin-top:8px;background:linear-gradient(to right, #60a5fa, #a855f7);color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer">Email me a reset link</button>
                  </form>

                  <p id="rp-err" style="color:#c00;margin-top:10px;font-weight:600"></p>
                </div>

                <script>
                  // FILL THESE:
                  const SUPABASE_URL = "https://cloyucntnunxptefkhnr.supabase.co";
                  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsb3l1Y250bnVueHB0ZWZraG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTg2MDIsImV4cCI6MjA3MjY3NDYwMn0.L8fq9-mqJx2Xk_BEOk0wk9voGCXgp5oRvvJT3gtx2Sg";

                  function setMsg(t){ document.getElementById('rp-msg').textContent = t || ""; }
                  function setErr(t){ document.getElementById('rp-err').textContent = t || ""; }

                  document.addEventListener('DOMContentLoaded', async () => {
                    if (!window.supabase) { setErr("Supabase failed to load"); return; }
                    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

                    const url = new URL(window.location.href);
                    const code = url.searchParams.get('code');
                    const type = url.searchParams.get('type'); // Supabase sends type=recovery

                    const newForm = document.getElementById('rp-new');
                    const reqForm = document.getElementById('rp-request');

                    if (code) {
                      // Coming from the email link → exchange for a session, then let them set a new password
                      try {
                        const { error } = await supabase.auth.exchangeCodeForSession(code);
                        if (error) { setErr(error.message || "Link invalid or expired."); reqForm.style.display = 'block'; return; }
                        setMsg("Enter a new password and save.");
                        newForm.style.display = 'block';
                      } catch (e) {
                        setErr(e?.message || "Link invalid or expired."); reqForm.style.display = 'block';
                      }
                    } else {
                      // No code → show the "send reset email" form
                      setMsg("Enter your email and we'll send you a reset link.");
                      reqForm.style.display = 'block';
                    }

                    // Save new password
                    document.getElementById('rp-save')?.addEventListener('click', async () => {
                      setErr("");
                      const p1 = document.getElementById('rp-pass').value;
                      const p2 = document.getElementById('rp-pass2').value;
                      if (p1 !== p2) { setErr("Passwords do not match."); return; }
                      try {
                        const { error } = await supabase.auth.updateUser({ password: p1 });
                        if (error) { setErr(error.message); return; }
                        setMsg("Password updated. Redirecting…");
                        // Send them to sign in (or straight to plans if you prefer)
                        setTimeout(() => { window.location.assign('/auth'); }, 800);
                      } catch (e) {
                        setErr(e?.message || "Could not update password.");
                      }
                    });

                    // Request a reset email (optional UX if someone opens page directly)
                    document.getElementById('rp-send')?.addEventListener('click', async () => {
                      setErr("");
                      const email = document.getElementById('rp-email').value.trim();
                      if (!email) { setErr("Email is required."); return; }
                      try {
                        const { error } = await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: \`\${window.location.origin}/reset-password\`
                        });
                        if (error) { setErr(error.message); return; }
                        setMsg("If that email exists, a reset link is on the way.");
                      } catch (e) {
                        setErr(e?.message || "Could not send email.");
                      }
                    });
                  });
                </script>
              `,
            }}
          />
        </div>
      </div>
    </div>
  )
}
