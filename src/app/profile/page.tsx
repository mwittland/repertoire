import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import { signOut } from "@/app/actions/auth";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");
  const { data: profile } = await supabase
    .from("profiles")
    .select("email,handedness")
    .eq("id", user.id)
    .maybeSingle();
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <section className="py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Settings
          </p>
          <h1 className="mt-4 text-6xl leading-none">Settings</h1>
          <p className="mt-6 text-lg text-[var(--muted)]">{profile?.email}</p>
          <ProfileForm
            initialHandedness={
              profile?.handedness === "Left" ? "Left" : "Right"
            }
          />
          <form action={signOut} className="mt-10">
            <button className="nav-action px-4 py-2">Sign out</button>
          </form>
        </section>
      </div>
    </main>
  );
}
