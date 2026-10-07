"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string };

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const signupSchema = credentialsSchema.extend({
  handedness: z.enum(["Right", "Left"]),
});

function readCredentials(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

function readSignup(formData: FormData) {
  return signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    handedness: formData.get("handedness"),
  });
}

export async function signIn(
  _: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const credentials = readCredentials(formData);
  if (!credentials.success)
    return {
      error: credentials.error.issues[0]?.message ?? "Check your details.",
    };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials.data);
  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "Please confirm your email before signing in." };
    }
    return { error: "Those credentials did not work." };
  }
  redirect("/");
}

export async function signUp(
  _: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const credentials = readSignup(formData);
  if (!credentials.success)
    return {
      error: credentials.error.issues[0]?.message ?? "Check your details.",
    };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: credentials.data.email,
    password: credentials.data.password,
    options: { data: { handedness: credentials.data.handedness } },
  });
  if (error) return { error: error.message };
  if (data.session) redirect("/");
  redirect("/login?message=Check your email to confirm your account.");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
