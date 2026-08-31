"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Recycle,
  Zap,
  Leaf,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LandingPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setFormError(
          error.message === "Invalid login credentials"
            ? "Incorrect email or password."
            : error.message,
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError("Unable to sign in right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#070f13] px-4 py-12 text-white">
      {/* Background gradient orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute -bottom-48 -right-40 h-[36rem] w-[36rem] rounded-full bg-teal-400/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[110px]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(90deg, #ffffff22 1px, transparent 1px)",
            backgroundSize: "46px 46px",
          }}
        />
        {/* Floating eco icons */}
        <Recycle className="absolute left-[10%] top-[18%] h-24 w-24 rotate-12 text-emerald-400/10" />
        <Zap className="absolute right-[12%] top-[26%] h-20 w-20 text-teal-300/10" />
        <Leaf className="absolute bottom-[16%] left-[14%] h-20 w-20 text-emerald-300/10" />
        <Zap className="absolute bottom-[24%] right-[10%] h-24 w-24 -rotate-12 text-cyan-300/10" />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col">
        {/* Brand header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/40">
            <Recycle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Bawat<span className="text-emerald-400">Pieza</span>
          </h1>
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.22em] text-emerald-100/50">
            Waste Into Watts Ion
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <h2 className="mb-1 text-2xl font-semibold">Welcome back</h2>
          <p className="mb-7 text-sm text-white/60">
            Sign in to your BawatPieza account to continue.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="mb-2 block text-sm font-medium text-white/80" htmlFor="email">
              Email
            </label>
            <div className="relative mb-1">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`w-full rounded-xl border bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 ${
                  errors.email ? "border-red-400/70" : "border-white/10"
                }`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="mb-3 mt-1 text-xs text-red-300">{errors.email.message}</p>
            )}

            <div className="mb-1 mt-5 flex items-center justify-between">
              <label className="block text-sm font-medium text-white/80" htmlFor="password">
                Password
              </label>
              <button
                type="button"
                className="text-xs font-medium text-emerald-300 hover:text-emerald-200"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`w-full rounded-xl border bg-white/[0.04] py-3 pl-11 pr-12 text-sm text-white placeholder-white/30 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 ${
                  errors.password ? "border-red-400/70" : "border-white/10"
                }`}
                {...register("password")}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/70"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mb-3 mt-1 text-xs text-red-300">{errors.password.message}</p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-emerald-400"
                />
                Remember me
              </label>
            </div>
            {formError && (
              <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs uppercase tracking-widest text-white/40">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] py-3 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1A6.6 6.6 0 0 1 5.54 12c0-.73.11-1.44.3-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-white/60">
            Don&apos;t have an account?{" "}
            <button className="font-semibold text-emerald-300 hover:text-emerald-200">
              Sign up
            </button>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-white/40">
          © {new Date().getFullYear()} BawatPieza · Sustainable energy for everyone.
        </p>
      </div>
    </main>
  );
}
