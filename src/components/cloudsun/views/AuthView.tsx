"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { product } from "@/config/cloudsun";
import { Button } from "@/components/cloudsun/shared/Button";
import {
  Sun, Mail, Lock, ArrowRight, ArrowLeft, Shield, Phone, Smartphone,
  CheckCircle2, AlertCircle, RefreshCw, KeyRound, Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Shared auth shell                                                    */
/* ------------------------------------------------------------------ */

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-surface-app">
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sun className="h-7 w-7" aria-hidden />
            </div>
            <h1 className="font-display text-xl font-semibold text-foreground">{product.name}</h1>
            <p className="text-sm text-muted-foreground">{product.eyebrow}</p>
          </div>
          {children}
        </div>
      </div>
      <footer className="border-t border-border bg-card/50 px-4 py-4 text-center text-xs text-muted-foreground">
        <p>© 2026 CloudSun. All rights reserved.</p>
        <p className="mt-1">Demonstration workspace — no real authentication is performed.</p>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Login / Signup view                                                  */
/* ------------------------------------------------------------------ */

export function AuthView() {
  const authStep = useAuthStore((s) => s.authStep);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword);
  const startSignup = useAuthStore((s) => s.startSignup);
  const startLogin = useAuthStore((s) => s.startLogin);
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const changeMobile = useAuthStore((s) => s.changeMobile);
  const currentUser = useAuthStore((s) => s.currentUser);
  const otpCode = useAuthStore((s) => s.otpCode);
  const otpAttempts = useAuthStore((s) => s.otpAttempts);
  const otpExpiresAt = useAuthStore((s) => s.otpExpiresAt);
  const setAuthPhase = useAuthStore((s) => s.setAuthPhase);
  const backToLanding = () => setAuthPhase("public");

  const [mode, setMode] = React.useState<"login" | "signup">(
    authStep === "signup" ? "signup" : "login"
  );
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // OTP view
  if (authStep === "otp") {
    return (
      <AuthShell>
        <OtpForm
          mobile={currentUser?.mobileNumber ?? mobile}
          otpCode={otpCode}
          otpAttempts={otpAttempts}
          otpExpiresAt={otpExpiresAt}
          onVerify={verifyOtp}
          onResend={resendOtp}
          onChangeNumber={changeMobile}
          onSend={sendOtp}
        />
      </AuthShell>
    );
  }

  const handleGoogle = () => {
    setLoading(true);
    setError("");
    // Simulated Google sign-in — uses a demonstration Google account
    setTimeout(() => {
      const demoEmail = email || "avery.kessler@cloudsun.example";
      const demoName = name || "Avery Kessler";
      signInWithGoogle(demoEmail, demoName);
      setLoading(false);
    }, 800);
  };

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      signInWithPassword(email, password);
      setLoading(false);
    }, 600);
  };

  return (
    <AuthShell>
      <div className="rounded-2xl border border-border bg-card p-6 elevation-raised">
        <button onClick={backToLanding} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </button>

        <h2 className="font-display text-2xl font-semibold text-foreground">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login"
            ? "Sign in to your CloudSun workspace."
            : "Start your IT customer operations workspace."}
        </p>

        {/* Google sign-in — recommended primary method */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Google sign-in uses identity scopes only (name, email, profile).
        </p>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Email/password form */}
        <form onSubmit={handlePassword} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label htmlFor="name" className="mb-1 block text-xs font-medium text-muted-foreground">Full name</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Avery Kessler"
                  className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-muted-foreground">Email address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-muted-foreground">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5" /> {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            className="font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-border bg-card/50 px-4 py-2.5 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5 text-forest" />
        After sign-in, you'll verify your mobile number via OTP.
      </div>
    </AuthShell>
  );
}

/* ------------------------------------------------------------------ */
/* OTP verification form                                                */
/* ------------------------------------------------------------------ */

function OtpForm({
  mobile,
  otpCode,
  otpAttempts,
  otpExpiresAt,
  onVerify,
  onResend,
  onChangeNumber,
  onSend,
}: {
  mobile: string;
  otpCode: string | null;
  otpAttempts: number;
  otpExpiresAt: string | null;
  onVerify: (code: string) => boolean;
  onResend: () => void;
  onChangeNumber: () => void;
  onSend: (mobile: string) => void;
}) {
  const [digits, setDigits] = React.useState<string[]>(Array(6).fill(""));
  const [error, setError] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(0);
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([]);
  const [mobileInput, setMobileInput] = React.useState(mobile);
  const [enteringMobile, setEnteringMobile] = React.useState(!mobile);

  // Auto-send OTP when we have a mobile number but no code yet
  React.useEffect(() => {
    if (mobile && !otpCode && !enteringMobile) {
      onSend(mobile);
    }
  }, [mobile, otpCode, enteringMobile, onSend]);

  // Countdown for resend cooldown
  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  // Focus first input when OTP is sent
  React.useEffect(() => {
    if (otpCode && !enteringMobile) {
      inputsRef.current[0]?.focus();
    }
  }, [otpCode, enteringMobile]);

  // Check expiry
  const expired = otpExpiresAt ? Date.now() > new Date(otpExpiresAt).getTime() : false;
  const tooManyAttempts = otpAttempts >= 5;

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError("");
    // Auto-advance
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const next = Array(6).fill("");
      pasted.split("").forEach((d, i) => (next[i] = d));
      setDigits(next);
      inputsRef.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setVerifying(true);
    setError("");
    setTimeout(() => {
      const ok = onVerify(code);
      if (!ok) {
        setError(tooManyAttempts ? "Too many attempts. Please resend a new code." : "Incorrect code. Please try again.");
        setDigits(Array(6).fill(""));
        inputsRef.current[0]?.focus();
      }
      setVerifying(false);
    }, 400);
  };

  const handleResend = () => {
    onResend();
    setDigits(Array(6).fill(""));
    setError("");
    setSecondsLeft(30);
    inputsRef.current[0]?.focus();
  };

  const handleSendMobile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileInput || mobileInput.length < 8) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setError("");
    setEnteringMobile(false);
    onSend(mobileInput);
  };

  // Mobile entry step
  if (enteringMobile) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 elevation-raised">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Smartphone className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">Verify your mobile</h2>
            <p className="text-xs text-muted-foreground">We'll send a one-time code to confirm your number.</p>
          </div>
        </div>
        <form onSubmit={handleSendMobile} className="space-y-3">
          <div>
            <label htmlFor="mobile" className="mb-1 block text-xs font-medium text-muted-foreground">Mobile number</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id="mobile"
                type="tel"
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value)}
                placeholder="+1 555 0100"
                className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Include country code (e.g. +1, +91).</p>
          </div>
          {error && <p className="flex items-center gap-1.5 text-xs text-destructive"><AlertCircle className="h-3.5 w-3.5" /> {error}</p>}
          <Button type="submit" className="w-full">Send code</Button>
        </form>
      </div>
    );
  }

  // OTP entry step
  return (
    <div className="rounded-2xl border border-border bg-card p-6 elevation-raised">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <KeyRound className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Enter verification code</h2>
          <p className="text-xs text-muted-foreground">
            Sent to <span className="font-medium text-foreground">{mobile}</span>{" "}
            <button onClick={onChangeNumber} className="text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Change</button>
          </p>
        </div>
      </div>

      {/* Demonstration code display — clearly labelled */}
      {otpCode && (
        <div className="mb-4 rounded-lg border border-ember/30 bg-ember/5 px-3 py-2 text-center">
          <p className="text-xs font-medium text-ember">Demonstration code</p>
          <p className="font-mono text-lg font-bold tracking-widest text-foreground">{otpCode}</p>
          <p className="text-[10px] text-muted-foreground">In production, this would be sent via SMS.</p>
        </div>
      )}

      {expired && (
        <p className="mb-3 flex items-center gap-1.5 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning-foreground">
          <AlertCircle className="h-3.5 w-3.5" /> This code has expired. Please request a new one.
        </p>
      )}
      {tooManyAttempts && (
        <p className="mb-3 flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" /> Too many attempts. Please resend a new code.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={expired || tooManyAttempts}
              aria-label={`Digit ${i + 1}`}
              className="h-12 w-12 rounded-lg border border-input bg-card text-center text-lg font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          ))}
        </div>

        {error && <p className="mt-3 flex items-center gap-1.5 text-xs text-destructive"><AlertCircle className="h-3.5 w-3.5" /> {error}</p>}

        <Button type="submit" className="mt-4 w-full" disabled={verifying || expired || tooManyAttempts || digits.join("").length !== 6}>
          {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Verify
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Didn't receive it?</span>
        {secondsLeft > 0 ? (
          <span className="text-muted-foreground">Resend in {secondsLeft}s</span>
        ) : (
          <button onClick={handleResend} className="inline-flex items-center gap-1 font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
            <RefreshCw className="h-3 w-3" /> Resend code
          </button>
        )}
      </div>
    </div>
  );
}
