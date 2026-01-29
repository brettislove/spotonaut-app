import { signOut, signIn } from "next-auth/react";
import { z } from "zod";
import { toast } from "sonner";
import { Dispatch, SetStateAction } from "react";

const loginSchema = z.object({
  email: z.string().min(1, "E-mail je povinný"),
  password: z.string().min(1, "Heslo je povinné"),
});

/**
 * Handles user sign out by resetting analysis state and signing out the user.
 * @param param0 resetAnalysis - Function to reset the analysis state.
 * @returns A promise that resolves when the sign-out process is complete.
 */
const handleSignOut = async ({
  resetAnalysis,
}: {
  resetAnalysis: () => void;
}) => {
  // Clear analysis state before signing out
  resetAnalysis();
  await signOut({ callbackUrl: "/" });
};

/**
 * Handles user login by validating credentials and managing loading and error states.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @param setIsLoading - Function to set the loading state.
 * @param setError - Function to set the error message.
 * @returns A promise that resolves when the login process is complete.
 */
const handleLogin = async (
  email: string,
  password: string,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string) => void,
) => {
  setIsLoading(true);
  setError("");

  // Validate with zod
  const validationResult = loginSchema.safeParse({ email, password });
  if (!validationResult.success) {
    setError(validationResult.error.errors[0].message);
    setIsLoading(false);
    return;
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // Map known next-auth/client error codes to user-friendly messages
    const mapNextAuthError = (err?: string | null) => {
      if (!err) return "Přihlášení se nezdařilo";
      const e = err.toString();
      if (
        e.toLowerCase().includes("credentials") ||
        e.toLowerCase().includes("invalid") ||
        e.toLowerCase().includes("neplatn") ||
        e.toLowerCase().includes("configuration")
      )
        return "Neplatné přihlašovací údaje";
      // fallback to the original error message
      return e;
    };

    if (result?.error) {
      // show friendly mapped message instead of raw token like 'Configuration'
      setError(mapNextAuthError(result.error));
    } else if (result?.ok) {
      window.location.reload();
    }
  } catch (error) {
    setError(
      error instanceof Error ? error.message : "Přihlášení se nezdařilo",
    );
  } finally {
    setIsLoading(false);
  }
};

/**
 * Handles user signup by validating inputs, creating account, and managing states.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @param confirmPassword - Confirmation of the password.
 * @param acceptTerms - Whether the user accepted the terms.
 * @param name - The user's name.
 * @param promoCode - Optional promo code.
 * @param setIsLoading - Function to set the loading state.
 * @param setError - Function to set the error message.
 * @param setSuccess - Function to set the success message.
 * @param onSwitchToLogin - Function to switch to login modal.
 * @returns A promise that resolves when the signup process is complete.
 */
const handleSignup = async (
  email: string,
  password: string,
  confirmPassword: string,
  acceptTerms: boolean,
  promoCode: string,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string) => void,
  onSwitchToLogin: () => void,
) => {
  setIsLoading(true);
  setError("");

  // Custom validation for empty fields
  if (!email || !password) {
    setError("Vyplňte prosím všechna povinná pole");
    setIsLoading(false);
    return;
  }

  // Require acceptance of terms before signup
  if (!acceptTerms) {
    setError("Musíte souhlasit s Podmínkami použití");
    setIsLoading(false);
    return;
  }

  // Basic validation: minimal length and matching confirm password
  if (password.length < 6) {
    setError("Heslo musí mít alespoň 6 znaků");
    setIsLoading(false);
    return;
  }
  if (password !== confirmPassword) {
    setError("Hesla se neshodují");
    setIsLoading(false);
    return;
  }

  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        promoCode: promoCode.trim() || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registrace se nezdařila");
    }

    // Auto-login after successful signup
    const loginResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (loginResult?.ok) {
      window.location.reload();
      // Notify user with toast that account was created and email was sent
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
    } else {
      // If auto-login didn't happen, show friendly success message and switch to login
      toast.success("Registrace úspěšná! Přihlaste se prosím.", {
        position: "top-center",
        style: {
          backgroundColor: "#14532d",
          color: "white",
          border: "2px solid #22c55e",
        },
      });
      onSwitchToLogin();
    }
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : "Registrace se nezdařila. Zkuste to prosím později.",
      {
        position: "top-center",
        style: {
          backgroundColor: "#601212",
          color: "white",
          border: "2px solid #b91c1c",
        },
      },
    );
  } finally {
    setIsLoading(false);
  }
};

/**
 * Handles Google sign-in by initiating the OAuth flow and managing states.
 * @param setIsLoading - Function to set the loading state.
 * @param setError - Function to set the error message.
 * @returns A promise that resolves when the Google sign-in process is complete.
 */
const handleGoogleSignIn = async (
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string>>,
) => {
  try {
    setIsLoading(true);
    setError("");
    await signIn("google", { callbackUrl: "/" });
  } catch {
    toast.error("Nepodařilo se přihlásit přes Google", {
      position: "top-center",
      style: {
        backgroundColor: "#601212",
        color: "white",
        border: "2px solid #b91c1c",
      },
    });
    setError("Nepodařilo se přihlásit přes Google");
    setIsLoading(false);
  }
  setIsLoading(false);
};

export { handleSignOut, handleLogin, handleSignup, handleGoogleSignIn };
