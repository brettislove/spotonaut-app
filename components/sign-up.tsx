import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import SpotonautLogo from "./spotonaut-logo";
import { useState } from "react";
import { handleSignup } from "@/utils/auth";
import { toast } from "sonner";

export default function SignUpPage({
  isOpen,
  onClose,
  onSwitchToLogin,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordValid, setConfirmPasswordValid] = useState<
    boolean | null
  >(null);
  const [passwordError, setPasswordError] = useState("");
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeStatus, setPromoCodeStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validatePassword = (pwd: string) => {
    if (pwd.length > 0 && pwd.length < 6) {
      setPasswordError("Heslo musí mít alespoň 6 znaků");
    } else {
      setPasswordError("");
    }
  };

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;

    setPromoCodeStatus("checking");

    // Simulate API call - replace with actual validation logic
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation - in real app, this would check against your backend
    const validCodes = ["WELCOME2024", "SPOTONAUT", "DISCOUNT50"];
    const isValid = validCodes.includes(promoCode.toUpperCase());

    setPromoCodeStatus(isValid ? "valid" : "invalid");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignup(
      email,
      password,
      confirmPassword,
      agreeToTerms,
      promoCode,
      setIsLoading,
      setError,
      onSwitchToLogin,
    ).then(() => {
      toast.success(
        "Registrace úspěšná — zkontrolujte svůj e-mail pro potvrzení.",
        {
          position: "top-center",
          style: {
            backgroundColor: "#14532d",
            color: "white",
            border: "2px solid #22c55e",
          },
        },
      );
    });
  };

  if (!isOpen) return null;
  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <form
        className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-md border shadow-2xl shadow-zinc-950/20 dark:[--color-muted:var(--color-zinc-900)]"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleFormSubmit}
      >
        <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
          <div className="text-center">
            <Link href="/" aria-label="go home" className="mx-auto block w-fit">
              <SpotonautLogo />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">
              Vytvořit účet u Spotonauta
            </h1>
            <p className="text-sm">Vítejte!</p>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pwd" className="text-sm">
                  Heslo
                </Label>
              </div>
              <Input
                type="password"
                required
                name="pwd"
                id="pwd"
                placeholder="Alespoň 6 znaků"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  // Clear error when user starts typing again
                  if (passwordError && val.length >= 6) {
                    setPasswordError("");
                  }
                  // Re-validate confirm immediately when password changes
                  setConfirmPasswordValid(
                    confirmPassword ? val === confirmPassword : null,
                  );
                }}
                onBlur={() => validatePassword(password)}
                className={`input sz-md variant-mixed ${
                  passwordError ? "border-red-500" : ""
                }`}
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-400">{passwordError}</p>
              )}
            </div>

            <div className="space-y-0.5">
              <Label htmlFor="confirmPwd" className="text-sm">
                Potvrzení hesla
              </Label>
              <Input
                type="password"
                required
                name="confirmPwd"
                id="confirmPwd"
                placeholder="Zadejte heslo znovu"
                value={confirmPassword}
                onChange={(e) => {
                  const val = e.target.value;
                  setConfirmPassword(val);
                  setConfirmPasswordValid(password === val);
                }}
                className={`input sz-md variant-mixed ${
                  confirmPasswordValid === false
                    ? "border-red-500"
                    : confirmPasswordValid === true && password.length > 0
                      ? "border-green-500"
                      : ""
                }`}
              />
              {confirmPasswordValid === false && (
                <p className="mt-2 text-sm text-red-400">Hesla se neshodují</p>
              )}
              {confirmPasswordValid === true && password.length > 0 && (
                <p className="mt-2 text-sm text-green-400">Hesla se shodují</p>
              )}
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setShowPromoCode(!showPromoCode)}
              >
                {showPromoCode ? "Skrýt promo kód" : "Máte promo kód?"}
              </Button>
              {showPromoCode && (
                <div className="space-y-2">
                  <Label htmlFor="promoCode" className="block text-sm">
                    Promo kód (volitelné)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      name="promoCode"
                      id="promoCode"
                      placeholder="Zadejte promo kód"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        // Reset status when user types
                        if (promoCodeStatus !== "idle") {
                          setPromoCodeStatus("idle");
                        }
                      }}
                      className={`input sz-md variant-mixed flex-1 ${
                        promoCodeStatus === "valid"
                          ? "border-green-500"
                          : promoCodeStatus === "invalid"
                            ? "border-red-500"
                            : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={validatePromoCode}
                      disabled={
                        !promoCode.trim() || promoCodeStatus === "checking"
                      }
                      className="shrink-0 h-9"
                    >
                      {promoCodeStatus === "checking"
                        ? "Kontroluji..."
                        : promoCodeStatus === "valid"
                          ? "✓ Platný"
                          : promoCodeStatus === "invalid"
                            ? "✗ Neplatný"
                            : "Ověřit"}
                    </Button>
                  </div>
                  {promoCodeStatus === "valid" && (
                    <p className="text-sm text-green-400">
                      Promo kód je platný!
                    </p>
                  )}
                  {promoCodeStatus === "invalid" && (
                    <p className="text-sm text-red-400">Neplatný promo kód</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) =>
                  setAgreeToTerms(checked as boolean)
                }
                required
              />
              <Label
                htmlFor="terms"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Souhlasím s
                <Link
                  href="/terms"
                  className="text-sm text-primary leading-none hover:underline"
                >
                  podmínkami použití
                </Link>
              </Label>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && <p className="text-sm text-green-400">{success}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={!agreeToTerms || isLoading}
            >
              {isLoading ? "Vytvářím účet..." : "Vytvořit účet"}
            </Button>
          </div>

          <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <hr className="border-dashed" />
            <span className="text-muted-foreground text-xs">
              Nebo pokračujte s
            </span>
            <hr className="border-dashed" />
          </div>

          <div className="grid grid-cols-1">
            <Button type="button" variant="outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="0.98em"
                height="1em"
                viewBox="0 0 256 262"
              >
                <path
                  fill="#4285f4"
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                ></path>
                <path
                  fill="#34a853"
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                ></path>
                <path
                  fill="#fbbc05"
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                ></path>
                <path
                  fill="#eb4335"
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                ></path>
              </svg>
              <span>Google</span>
            </Button>
          </div>
        </div>

        <div className="p-3">
          <p className="text-accent-foreground text-center text-sm">
            Už máte účet?
            <Button variant="link" className="px-2" onClick={onSwitchToLogin}>
              Přihlásit se
            </Button>
          </p>
        </div>
      </form>
    </section>
  );
}
