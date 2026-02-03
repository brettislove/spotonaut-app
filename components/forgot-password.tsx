import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import SpotonautLogo from "./spotonaut-logo";

export default function ForgotPasswordPage({
  isOpen,
  onClose,
  onSwitchToLogin,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement password reset logic here
  };

  if (!isOpen) return null;
  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <form
        className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-md border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <SpotonautLogo />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">Obnova hesla</h1>
            <p className="text-sm">
              Zadejte svůj e-mail pro zaslání odkazu na obnovení hesla
            </p>
          </div>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Email
              </Label>
              <Input
                type="email"
                required
                name="email"
                id="email"
                placeholder="vas@email.cz"
              />
            </div>

            <Button className="w-full">Odeslat odkaz</Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Zašleme vám e-mail s odkazem na obnovení hesla.
            </p>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Pamatujete si své heslo?
            <Button asChild variant="link" className="px-2 cursor-pointer">
              <Link href="" onClick={onSwitchToLogin}>
                Přihlásit se
              </Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
