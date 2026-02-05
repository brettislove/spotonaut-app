"use client";

import { useState } from "react";
import {
  Context,
  ContextContent,
  ContextContentBody,
  ContextContentHeader,
  ContextTrigger,
} from "@/components/ai-elements/context";

const NavCreditMeter = () => {
  const [open, setOpen] = useState(false);

  // Mock data - replace with real implementation later
  const usedCredits = 1;
  const maxCredits = 3;
  const unlimited = false;

  const remaining = maxCredits - usedCredits;
  const displayText = unlimited ? "∞" : remaining.toString();

  return (
    <div className="flex items-center justify-center bg-primary/10 rounded-md text-sm font-medium text-primary-foreground">
      Zbývající kredity:
      <Context
        usedCredits={usedCredits}
        maxCredits={maxCredits}
        unlimited={unlimited}
        open={open}
        onOpenChange={setOpen}
      >
        <ContextTrigger />
        <ContextContent>
          <ContextContentHeader />
          <ContextContentBody>
            {/* Additional credit information can be added here */}
          </ContextContentBody>
        </ContextContent>
      </Context>
    </div>
  );
};

export default NavCreditMeter;
