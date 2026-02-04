"use client";

import { useAnalysis } from "@/lib/contexts/analysis-context";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AnalysisDialogs() {
  const {
    showMigrationDialog,
    setShowMigrationDialog,
    showOverwriteDialog,
    setShowOverwriteDialog,
    confirmOverwriteAndSave,
    loadFromDatabase,
    resetAnalysis,
  } = useAnalysis();

  // Handle migration dialog - user has local analysis and existing DB analysis
  const handleMigrationConfirm = async () => {
    setShowMigrationDialog(false);
    await confirmOverwriteAndSave();
  };

  const handleMigrationKeepExisting = async () => {
    setShowMigrationDialog(false);
    // Clear local state and load from database instead
    resetAnalysis();
    await loadFromDatabase();
  };

  // Handle overwrite dialog - new analysis will replace existing
  const handleOverwriteConfirm = async () => {
    await confirmOverwriteAndSave();
  };

  const handleOverwriteCancel = () => {
    setShowOverwriteDialog(false);
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
