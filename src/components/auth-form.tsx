"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/actions/auth";

type AuthAction = (state: AuthState, formData: FormData) => Promise<AuthState>;

export function AuthForm({
  action,
  mode,
}: {
  action: AuthAction;
  mode: "login" | "signup";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isLogin = mode === "login";
  return (
    <form action={formAction} className="mt-8 space-y-5">
      <label className="block text-sm text-[var(--muted)]">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 text-[var(--ink)]"
        />
      </label>
      {!isLogin && (
        <label className="block text-sm text-[var(--muted)]">
          Handedness
          <select
            name="handedness"
            required
            defaultValue="Right"
            className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 text-[var(--ink)]"
          >
            <option value="Right">Right handed</option>
            <option value="Left">Left handed</option>
          </select>
        </label>
      )}
      <label className="block text-sm text-[var(--muted)]">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={isLogin ? "current-password" : "new-password"}
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 text-[var(--ink)]"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-[var(--coral)]">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="w-full rounded-xl bg-[var(--ink)] px-5 py-4 font-bold text-white disabled:opacity-60"
      >
        {pending ? "Working..." : isLogin ? "Sign in" : "Create account"}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        {isLogin ? "New to Repertoire?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="font-bold text-[var(--teal)]"
        >
          {isLogin ? "Create one" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
