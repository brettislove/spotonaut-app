"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconDots, IconShare3, IconTrash } from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil } from "lucide-react";
import { Analysis } from "@/lib/types/analysis";

export function NavHistory({
  analyses,
  activeAnalysisId,
  onRename,
  onDelete,
}: {
  analyses: Analysis[];
  activeAnalysisId?: string;
  onRename?: (id: string, newName: string) => void;
  onDelete?: (id: string) => void;
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameAnalysisId, setRenameAnalysisId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAnalysisId, setDeleteAnalysisId] = useState<string | null>(null);
  const [deleteAnalysisName, setDeleteAnalysisName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRenameClick = (analysis: Analysis) => {
    setRenameAnalysisId(analysis.id);
    setRenameValue(analysis.locationName);
    setOriginalValue(analysis.locationName);
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = async () => {
    if (
      !renameAnalysisId ||
      !renameValue.trim() ||
      renameValue.trim() === originalValue
    )
      return;

    setIsRenaming(true);
    try {
      const response = await fetch(`/api/analysis/${renameAnalysisId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationName: renameValue.trim() }),
      });

      if (response.ok) {
        const newName = renameValue.trim();
        onRename?.(renameAnalysisId, newName);
        window.dispatchEvent(
          new CustomEvent("analysis-renamed", {
            detail: { id: renameAnalysisId, locationName: newName },
          }),
        );
        setRenameDialogOpen(false);
      }
    } catch (error) {
      console.error("Error renaming analysis:", error);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteClick = (analysis: Analysis) => {
    setDeleteAnalysisId(analysis.id);
    setDeleteAnalysisName(analysis.locationName);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAnalysisId || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/analysis/${deleteAnalysisId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDelete?.(deleteAnalysisId);
        window.dispatchEvent(
          new CustomEvent("analysis-deleted", {
            detail: { id: deleteAnalysisId },
          }),
        );
        setDeleteDialogOpen(false);

        // If we deleted the currently viewed analysis, redirect to home
        if (deleteAnalysisId === activeAnalysisId) {
          router.push("/app");
        }
      }
    } catch (error) {
      console.error("Error deleting analysis:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Analýzy</SidebarGroupLabel>
        <SidebarMenu>
          {analyses.map((analysis) => (
            <SidebarMenuItem key={analysis.id}>
              <SidebarMenuButton
                asChild
                isActive={analysis.id === activeAnalysisId}
              >
                <Link href={`/app/analysis/${analysis.id}`}>
                  <span>{analysis.locationName}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="cursor-pointer">
                  <SidebarMenuAction
                    showOnHover
                    className="data-[state=open]:bg-accent rounded-sm"
                  >
                    <IconDots />
                    <span className="sr-only">Více</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-24 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem onClick={() => handleRenameClick(analysis)}>
                    <Pencil />
                    <span>Přejmenovat</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <IconShare3 />
                    <span>Sdílet</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => handleDeleteClick(analysis)}
                  >
                    <IconTrash />
                    <span>Smazat</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
          {/* <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <IconDots className="text-sidebar-foreground/70" />
              <span>Více</span>
            </SidebarMenuButton>
          </SidebarMenuItem> */}
        </SidebarMenu>
      </SidebarGroup>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Přejmenovat analýzu</DialogTitle>
            <DialogDescription>
              Zadejte nový název pro tuto analýzu.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Název lokace"
              maxLength={100}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRenameSubmit();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
              disabled={isRenaming}
            >
              Zrušit
            </Button>
            <Button
              onClick={handleRenameSubmit}
              disabled={
                isRenaming ||
                !renameValue.trim() ||
                renameValue.trim() === originalValue
              }
            >
              {isRenaming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Uložit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Smazat analýzu"
        description={`Opravdu chcete smazat analýzu "${deleteAnalysisName}"? Tuto akci nelze vrátit zpět.`}
        onConfirm={handleDeleteConfirm}
        confirmText="Smazat"
        cancelText="Zrušit"
        variant="destructive"
      />
    </>
  );
}
