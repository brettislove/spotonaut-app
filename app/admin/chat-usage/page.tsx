import { auth } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Coins } from "lucide-react";
import Link from "next/link";
import UpdateQuotaForm from "./update-quota-form";
import { getRemainingCredits, getTierName } from "@/lib/constants/tiers";

const prisma = new PrismaClient();

function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  if (!adminEmailsEnv) return [];
  try {
    const parsed = JSON.parse(adminEmailsEnv);
    if (Array.isArray(parsed))
      return parsed.map((e: string) => e.toLowerCase());
    return [];
  } catch (e) {
    console.error("Failed to parse ADMIN_EMAILS env var", e);
    return [];
  }
}

function isAdmin(email: string | null | undefined) {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export default async function AdminChatUsagePage() {
  const session = await auth();

  if (!session?.user?.email) redirect("/");
  if (!isAdmin(session.user.email)) redirect("/");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      tier: true,
      maxCredits: true,
      usedCredits: true,
    },
    orderBy: { email: "asc" },
  });

  return (
    <section className="py-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-7xl px-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-12 md:mb-20">
          <h1 className="text-4xl font-semibold lg:text-5xl flex items-center gap-3">
            <Coins className="w-8 h-8" />
            Uživatelské kredity
          </h1>
          <p className="text-muted-foreground">
            Správa tarifů a kreditových limitů uživatelů.
          </p>
        </div>

        {/* Credits Table */}
        <Card>
          <CardHeader>
            <CardTitle>Uživatelské kredity</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Jméno</TableHead>
                  <TableHead>Tarif</TableHead>
                  <TableHead>Použité kredity</TableHead>
                  <TableHead>Zbývá</TableHead>
                  <TableHead>Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const remaining = getRemainingCredits(
                    user.maxCredits,
                    user.usedCredits,
                  );
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email}
                      </TableCell>
                      <TableCell>{user.name ?? "—"}</TableCell>
                      <TableCell className="font-medium">
                        {getTierName(user.tier, false)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.usedCredits}
                      </TableCell>
                      <TableCell className="font-medium">
                        {remaining === null ? "∞" : remaining}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-3 items-center flex-wrap">
                          <UpdateQuotaForm
                            email={user.email!}
                            currentTier={user.tier}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
