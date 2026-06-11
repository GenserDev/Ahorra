import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { OnboardingWizard } from "./_components/onboarding-wizard";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, onboarded")
    .eq("id", user.id)
    .single();

  // Si ya completó el onboarding, no lo repetimos.
  if (profile?.onboarded) redirect("/home");

  const firstName =
    profile?.name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "ahorrador";

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 py-10">
      <Image
        src="/LogoAhorra.png"
        alt="Ahorra"
        width={120}
        height={91}
        priority
        className="absolute left-6 top-6 h-9 w-auto"
      />
      <ThemeToggle className="absolute right-6 top-6" />

      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
        <OnboardingWizard firstName={firstName} />
      </div>
    </main>
  );
}
