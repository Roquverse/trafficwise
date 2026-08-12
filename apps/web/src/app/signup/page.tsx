"use client";

import { useState, useTransition } from "react";
import { AtSign, Mail, Lock, EyeOff, Eye, LayoutGrid, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction } from "../actions/auth";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"commuter" | "ops">("commuter");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("role", role);

    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    startTransition(async () => {
      const result = await registerAction(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        if (result.role === "Ops") {
          router.push("/ops/map");
        } else {
          router.push("/map");
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Left Pane - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-teal-950 flex-col justify-center items-center p-12 overflow-hidden">
        {/* Abstract Background Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #0d9488 1px, transparent 1px), linear-gradient(to bottom, #0d9488 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950/80 via-teal-950/90 to-[#0a0a0a] pointer-events-none" />

        <div className="relative z-10 max-w-md w-full bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 p-10 rounded-[2rem] shadow-2xl">
          <div className="flex items-center space-x-3 mb-8">
            <AtSign className="text-primary" size={36} />
            <span className="text-3xl font-bold text-primary tracking-tight">TrafficWise</span>
          </div>

          <h2 className="text-3xl font-semibold text-slate-100 mb-8 leading-snug">
            Join the movement for smarter mobility.
          </h2>

          <div className="flex items-start space-x-4">
            <div className="w-8 h-1 bg-primary mt-2.5 shrink-0 rounded-full" />
            <p className="text-slate-300 text-lg leading-relaxed">
              Create an account to access predictive routing and real-time network analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Create Account</h1>
            <p className="text-slate-400">Get started with TrafficWise today.</p>
          </div>

          {/* Role Toggle */}
          <div className="bg-slate-900/80 p-1.5 rounded-xl flex space-x-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setRole("commuter")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                role === "commuter" 
                  ? "bg-slate-800 text-primary shadow-sm" 
                  : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              Commuter
            </button>
            <button
              type="button"
              onClick={() => setRole("ops")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                role === "ops" 
                  ? "bg-slate-800 text-primary shadow-sm" 
                  : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              Ops Console
            </button>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full bg-[#111111] border border-slate-800 text-slate-200 rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full bg-[#111111] border border-slate-800 text-slate-200 rounded-lg py-3 pl-11 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#111111] border border-slate-800 text-slate-200 rounded-lg py-3 pl-11 pr-11 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-slate-600 tracking-widest"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#111111] border border-slate-800 text-slate-200 rounded-lg py-3 pl-11 pr-11 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-slate-600 tracking-widest"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-lg transition-colors mt-4 shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[#0a0a0a] text-slate-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center space-x-2 bg-[#111111] border border-slate-800 hover:bg-slate-900 text-slate-300 py-3 rounded-lg transition-colors font-semibold text-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-[#111111] border border-slate-800 hover:bg-slate-900 text-slate-300 py-3 rounded-lg transition-colors font-semibold text-sm">
              <LayoutGrid size={18} />
              <span>SSO</span>
            </button>
          </div>

          <p className="text-center text-slate-400 mt-8 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:text-amber-400 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
