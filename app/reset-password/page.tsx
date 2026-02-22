"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import SpotonautLogo from "@/components/spotonaut-logo";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordValid, setConfirmPasswordValid] = useState<
    boolean | null
  >(null);
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(
    !token ? "Chybí token pro obnovení hesla" : "",
  );

  const validatePassword = (pwd: string) => {
    if (pwd.length > 0 && pwd.length < 6) {
      setPasswordError("Heslo musí mít alespoň 6 znaků");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Chybí token pro obnovení hesla");
      return;
    }

    // Validate password
    if (!validatePassword(password)) {
      return;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError("Hesla se neshodují");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Nepodařilo se obnovit heslo");
        setIsLoading(false);
        return;
      }

      // Auto-login the user
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Password reset succeeded but login failed
        toast.success(
          "Heslo bylo úspěšně obnoveno. Nyní se můžete přihlásit.",
          {
            position: "top-center",
            style: {
              backgroundColor: "#14532d",
              color: "white",
              border: "2px solid #22c55e",
            },
          },
        );
        router.push("/?login=true");
      } else {
        // Both password reset and login succeeded
        toast.success("Heslo bylo úspěšně obnoveno a jste přihlášeni.", {
          position: "top-center",
          style: {
            backgroundColor: "#14532d",
            color: "white",
            border: "2px solid #22c55e",
          },
        });
        router.push("/");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Nepodařilo se obnovit heslo");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-md border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
        <form
          className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6"
          onSubmit={handleSubmit}
        >
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <SpotonautLogo />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">Nové heslo</h1>
            <p className="text-sm">Zadejte své nové heslo</p>
          </div>

          <div className="mt-6 space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">
                  Nové heslo
                </Label>
              </div>
              <Input
                type="password"
                required
                name="password"
                id="password"
                placeholder="Alespoň 6 znaků"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  if (passwordError && val.length >= 6) {
                    setPasswordError("");
                  }
                  setConfirmPasswordValid(
                    confirmPassword ? val === confirmPassword : null,
                  );
                }}
                onBlur={() => validatePassword(password)}
                className={passwordError ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-400">{passwordError}</p>
              )}
            </div>

            <div className="space-y-0.5">
              <Label htmlFor="confirmPassword" className="text-sm">
                Potvrzení hesla
              </Label>
              <Input
                type="password"
                required
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Zadejte heslo znovu"
                value={confirmPassword}
                onChange={(e) => {
                  const val = e.target.value;
                  setConfirmPassword(val);
                  setConfirmPasswordValid(password === val);
                }}
                className={
                  confirmPasswordValid === false
                    ? "border-red-500"
                    : confirmPasswordValid === true && password.length > 0
                      ? "border-green-500"
                      : ""
                }
                disabled={isLoading}
              />
              {confirmPasswordValid === false && (
                <p className="mt-2 text-sm text-red-400">Hesla se neshodují</p>
              )}
              {confirmPasswordValid === true && password.length > 0 && (
                <p className="mt-2 text-sm text-green-400">Hesla se shodují</p>
              )}
            </div>

            <Button className="w-full" disabled={isLoading}>
              {isLoading ? "Obnovování..." : "Obnovit heslo"}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Po obnovení hesla budete automaticky přihlášeni.
            </p>
          </div>
        </form>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Pamatujete si své heslo?
            <Button asChild variant="link" className="px-2 cursor-pointer">
              <Link href="/?login=true">Přihlásit se</Link>
            </Button>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-md border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
            <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
              <div className="text-center">
                <Link
                  href="/"
                  aria-label="go home"
                  className="mx-auto block w-fit"
                >
                  <SpotonautLogo />
                </Link>
                <h1 className="mb-1 mt-4 text-xl font-semibold">Nové heslo</h1>
                <p className="text-sm">Načítání...</p>
              </div>
            </div>
          </div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
