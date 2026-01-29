"use client";

import React from "react";
import HeroSection from "@/components/hero-section";
import LoginPage from "@/components/login";
import SignUpPage from "@/components/sign-up";

export default function Home() {
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  const [signupModalOpen, setSignupModalOpen] = React.useState(false);

  return (
    <>
      <HeroSection
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
