import { auth } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import UpdateQuotaForm from "./update-quota-form";
import UpdatePendingForm from "./update-pending-form";

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
    select: { id: true, email: true, name: true },
    orderBy: { email: "asc" },
  });

  const usages = await prisma.chatUsage.findMany();
  const usageMap = new Map(usages.map((u) => [u.userId, u]));

  return (
    <div className="min-h-screen bg-slate-950 font-sans relative overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Chat Prompt Quotas</h1>
          <p className="text-slate-400">
            View and update per-user prompt quotas.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-4 text-slate-400 text-sm">
                    Email
                  </th>
                  <th className="text-left p-4 text-slate-400 text-sm">Name</th>
                  <th className="text-left p-4 text-slate-400 text-sm">
                    Prompts Used
                  </th>
                  <th className="text-left p-4 text-slate-400 text-sm">
                    Quota
                  </th>
                  <th className="text-left p-4 text-slate-400 text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const usage = usageMap.get(user.id);
                  const promptCount = usage?.promptCount ?? 0;
                  // Keep a numeric value for the update form, but display
                  // a friendly '∞' when quota is NULL (unlimited).
                  const currentQuota = usage?.quota ?? 3;
                  const displayQuota =
                    usage?.quota === null ? "∞" : currentQuota;
                  const pending = usage?.requestPending ?? false;
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4 text-slate-200 text-sm whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {user.name ?? "—"}
                      </td>
                      <td className="p-4 text-white font-medium">
                        {promptCount}
                      </td>
                      <td className="p-4 text-white font-medium">
                        {displayQuota}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-3 items-center">
                          <UpdateQuotaForm
                            email={user.email!}
                            currentQuota={currentQuota}
                          />
                          <UpdatePendingForm
                            email={user.email!}
                            currentPending={pending}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
