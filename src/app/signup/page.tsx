import { signUp } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-md">
        <section className="mt-16 rounded-3xl border border-[var(--line)] bg-[var(--card)] p-7 sm:p-9">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Start your repertoire
          </p>
          <h1 className="mt-3 text-4xl">Signup</h1>
          <AuthForm action={signUp} mode="signup" />
        </section>
      </div>
    </main>
  );
}
