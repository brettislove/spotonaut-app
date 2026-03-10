"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function BillingSuccessPage() {
  const { update } = useSession();

  useEffect(() => {
    void update();
  }, [update]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-3xl font-semibold">Platba přijata</h1>
      <p className="mt-4 text-muted-foreground">
        Děkujeme. Aktivace tarifu proběhne po potvrzení Stripe webhooku (obvykle
        do několika sekund).
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Button asChild>
          <Link href="/app/billing">Zpět na billing</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/pricing">Zpět na ceník</Link>
        </Button>
      </div>
    </main>
  );
}
