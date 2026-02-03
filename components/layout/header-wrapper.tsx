"use client";

import React from "react";
import { HeroHeader } from "@/components/header";
import LoginPage from "@/components/login";
import SignUpPage from "@/components/sign-up";
import { useAnalysis } from "@/lib/contexts/analysis-context";

export default function HeaderWrapper() {
  const {
    showLoginModal,
    setShowLoginModal,
    showSignupModal,
    setShowSignupModal,
  } = useAnalysis();

  return (
    <>
      <HeroHeader
        setLoginModalOpen={setShowLoginModal}
        setSignupModalOpen={setShowSignupModal}
      />
      <LoginPage
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      <SignUpPage
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
}
