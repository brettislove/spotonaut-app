"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function RequestMorePromptsModalNew({ isOpen, onClose }: Props) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequest = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/prompts/request", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }
      toast.success("Požadavek byl odeslán. Děkujeme!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Chyba při odesílání požadavku. Zkuste to prosím znovu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-left">
                Žádost o další dotazy
              </DialogTitle>
              <DialogDescription className="text-left space-y-2">
                <p>
                  Vyčerpali jste svůj limit dotazů. Můžete požádat tým Spotonaut
                  o navýšení kvóty.
                </p>
                <p>
                  Uživatel:{" "}
                  <strong className="text-foreground">
                    {session?.user?.email || "přihlaste se"}
                  </strong>
                </p>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-initial"
          >
            Zrušit
          </Button>
          <Button
            onClick={handleRequest}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {isSubmitting ? "Odesílám…" : "Požádat o více"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
