import { redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import TrafficDashboard from "@/components/admin/traffic-dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  if (!adminEmailsEnv) return [];
  try {
    const parsed = JSON.parse(adminEmailsEnv);
    return Array.isArray(parsed)
      ? parsed.map((email: string) => email.toLowerCase())
      : [];
  } catch {
    return [];
  }
}

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export default async function TrafficPage() {
  const session = await auth();

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect("/");
  }

  return (
    <section className="py-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět na dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-semibold">Traffic & UTM Kampaně</h1>
          <p className="text-muted-foreground mt-2">
            Sledování návštěvnosti dle zdroje, média a kampaně. Konverzní poměry
            registrací.
          </p>
        </div>

        {/* Client Dashboard */}
        <TrafficDashboard />
      </div>
    </section>
  );
}
