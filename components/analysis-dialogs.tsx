"use client";

import { useAnalysis } from "@/lib/contexts/analysis-context";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AnalysisDialogs() {
  const {
    showMigrationDialog,
    setShowMigrationDialog,
    showOverwriteDialog,
    confirmOverwriteAndSave,
    dismissOverwriteDialog,
    loadFromDatabase,
    resetAnalysis,
    fingerprint,
  } = useAnalysis();

  // Clean up fingerprint localStorage data after migration is handled
  const cleanupFingerprintData = () => {
    if (fingerprint) {
      try {
        localStorage.removeItem(`analysis_${fingerprint}`);
      } catch {
        // Ignore cleanup errors
      }
    }
  };

  // Handle migration dialog - user has local analysis and existing DB analysis
  const handleMigrationConfirm = async () => {
    setShowMigrationDialog(false);
    await confirmOverwriteAndSave();
    // Clean up fingerprint data after successful migration
    cleanupFingerprintData();
  };

  const handleMigrationKeepExisting = async () => {
    setShowMigrationDialog(false);
    // Clean up fingerprint localStorage data so migration dialog doesn't re-appear
    cleanupFingerprintData();
    // Clear local state and load from database instead
    resetAnalysis();
    await loadFromDatabase();
  };

  // Handle overwrite dialog - new analysis will replace existing
  const handleOverwriteConfirm = async () => {
    await confirmOverwriteAndSave();
  };

  const handleOverwriteCancel = () => {
    // Properly dismiss: reset isNewlyCompletedAnalysis flag to prevent
    // the auto-save effect from re-firing and showing the dialog again
    dismissOverwriteDialog();
  };

  return (
    <>
      {/* Migration Dialog - shown after login when user has local analysis and DB analysis */}
      <ConfirmDialog
        open={showMigrationDialog}
        onOpenChange={(open) => {
          if (!open) handleMigrationKeepExisting();
        }}
        title="Přepsat uloženou analýzu?"
        description="Máte neuloženou analýzu z této relace a zároveň již máte uloženou analýzu ve svém účtu. Chcete přepsat uloženou analýzu tou aktuální?"
        onConfirm={handleMigrationConfirm}
        confirmText="Přepsat a uložit"
        cancelText="Zachovat uloženou"
        variant="destructive"
      />

      {/* Overwrite Dialog - shown when completing new analysis while having existing saved one */}
      <ConfirmDialog
        open={showOverwriteDialog}
        onOpenChange={handleOverwriteCancel}
        title="Přepsat existující analýzu?"
        description="Již máte uloženou analýzu. Uložením nové analýzy bude stávající odstraněna. Chcete pokračovat?"
        onConfirm={handleOverwriteConfirm}
        confirmText="Přepsat"
        cancelText="Zrušit"
        variant="destructive"
      />
    </>
  );
}
