"use client";

import React from "react";
import { HeroHeader } from "@/components/header";
import LoginPage from "@/components/login";
import SignUpPage from "@/components/sign-up";

export default function HeaderWrapper() {
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  const [signupModalOpen, setSignupModalOpen] = React.useState(false);

  return (
    <>
      <HeroHeader
        setLoginModalOpen={setLoginModalOpen}
        setSignupModalOpen={setSignupModalOpen}
      />
      <LoginPage
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSwitchToSignup={() => {
          setLoginModalOpen(false);
          setSignupModalOpen(true);
        }}
      />
      <SignUpPage
        isOpen={signupModalOpen}
        onClose={() => setSignupModalOpen(false)}
        onSwitchToLogin={() => {
          setSignupModalOpen(false);
          setLoginModalOpen(true);
        }}
      />
    </>
  );
}
