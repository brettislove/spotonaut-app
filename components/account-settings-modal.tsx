"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user:
    | {
        name?: string | null;
        email?: string | null;
      }
    | undefined;
}

export function AccountSettingsModal({
  isOpen,
  onClose,
  user,
}: AccountSettingsModalProps) {
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Update name
      if (name !== user?.name) {
        const response = await fetch("/api/user/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Nepodařilo se aktualizovat jméno");
        }
      }

      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("Nová hesla se neshodují");
        }

        if (newPassword.length < 6) {
          throw new Error("Nové heslo musí mít alespoň 6 znaků");
        }

        const response = await fetch("/api/user/update-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Nepodařilo se změnit heslo");
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

      setSuccess("Profil byl úspěšně aktualizován");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Došlo k neočekávané chybě",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Nastavení profilu</DialogTitle>
          <DialogDescription>
            Upravte své osobní údaje a změňte heslo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Profile Information Section */}
          <div className="space-y-4">
            {/* Email (readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="cursor-not-allowed opacity-60"
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Jméno</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vaše jméno"
              />
            </div>
          </div>

          <Separator />

          {/* Password Section */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-4">Změnit heslo</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Nechte pole prázdná, pokud nechcete měnit heslo
              </p>
            </div>

            <div className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Současné heslo</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nové heslo</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {newPassword && newPassword.length < 6 && (
                  <p className="text-xs text-muted-foreground">
                    Heslo musí mít alespoň 6 znaků
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potvrdit nové heslo</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {confirmPassword &&
                  newPassword &&
                  confirmPassword !== newPassword && (
                    <p className="text-xs text-destructive">
                      Hesla se neshodují
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Zrušit
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Ukládání..." : "Uložit změny"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
