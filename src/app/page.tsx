import HowItWorksPage from "@/app/how-it-works/page";
import RepertoirePage from "@/app/repertoire/page";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? <RepertoirePage /> : <HowItWorksPage />;
}
