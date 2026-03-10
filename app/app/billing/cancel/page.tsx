import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BillingCancelPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-3xl font-semibold">Platba zrušena</h1>
      <p className="mt-4 text-muted-foreground">
        Žádná změna nebyla provedena. Nákup můžete kdykoliv dokončit znovu.
      </p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Button asChild>
          <Link href="/pricing#pricing-plans">Zkusit znovu</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/app/billing">Zpět na billing</Link>
        </Button>
      </div>
    </main>
  );
}
