"use client";

import { useState } from "react";
import {
  Context,
  ContextContent,
  ContextContentBody,
  ContextContentHeader,
  ContextTrigger,
} from "@/components/ai-elements/context";
import { useSession } from "next-auth/react";
import { isUnlimited } from "@/lib/constants/tiers";

const NavCreditMeter = () => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  console.log("NavCreditMeter session data:", session); // Debugging line

  // Get credits from session, preserving null for unlimited
  const usedCredits = session?.user?.usedCredits ?? 0;
  const maxCredits = session?.user ? session.user.maxCredits : 30;
  const unlimited = isUnlimited(maxCredits);

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
