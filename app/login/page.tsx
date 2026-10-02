"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        setError("We couldn't sign you in. Check your email and password, then try again.");
        return;
      }

      router.replace("/");
    } catch {
      setError("We couldn't sign you in right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      className="relative flex min-h-[calc(100svh-3.5rem)] items-center justify-center overflow-hidden px-4 py-10 text-slate-900 md:min-h-screen"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(16, 185, 129, 0.09), transparent 42%), linear-gradient(315deg, rgba(245, 158, 11, 0.08), transparent 40%)",
      }}
    >
      <section className="relative w-full max-w-md rounded-[24px] border border-white/80 bg-white/85 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-10">
        <div className="mb-9 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">
            L
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">LandlordOS</p>
            <p className="mt-0.5 text-xs text-slate-500">Property management</p>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to continue to your property dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isLoading}
              aria-describedby={error ? "login-error" : undefined}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 disabled:bg-slate-50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={isLoading}
              aria-describedby={error ? "login-error" : undefined}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 disabled:bg-slate-50"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p
              id="login-error"
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-800"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !email.trim() || !password}
            className="flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/15 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}