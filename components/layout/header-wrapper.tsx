"use client";

import React from "react";
import { HeroHeader } from "@/components/header";
import LoginPage from "@/components/login";
import SignUpPage from "@/components/sign-up";
import { useAnalysis } from "@/lib/contexts/analysis-context";
import ForgotPasswordPage from "../forgot-password";
import { AccountSettingsModal } from "@/components/account-settings-modal";
import { useSession } from "next-auth/react";

export default function HeaderWrapper() {
  const { data: session } = useSession();
  const {
    showLoginModal,
    setShowLoginModal,
    showSignupModal,
    setShowSignupModal,
    showForgotPasswordModal,
    setShowForgotPasswordModal,
    showAccountSettingsModal,
    setShowAccountSettingsModal,
  } = useAnalysis();

  return (
    <>
      <HeroHeader
        setLoginModalOpen={setShowLoginModal}
        setSignupModalOpen={setShowSignupModal}
        setAccountSettingsModalOpen={setShowAccountSettingsModal}
      />
      <LoginPage
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
        onSwitchToForgotPassword={() => {
          setShowLoginModal(false);
          setShowForgotPasswordModal(true);
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
      <ForgotPasswordPage
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onSwitchToLogin={() => {
          setShowForgotPasswordModal(false);
          setShowLoginModal(true);
        }}
      />
      <AccountSettingsModal
        isOpen={showAccountSettingsModal}
        onClose={() => setShowAccountSettingsModal(false)}
        user={session?.user}
      />
    </>
  );
}
