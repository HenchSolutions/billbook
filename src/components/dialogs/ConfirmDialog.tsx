import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/core/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  /** When true, disables Cancel/Confirm, blocks escape/outside-close, and shows a spinner on Confirm. */
  confirming?: boolean;
  confirmingText?: string;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "default",
  confirming = false,
  confirmingText = "Please wait...",
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={confirming ? undefined : onOpenChange}>
      <AlertDialogContent onEscapeKeyDown={(e: Event) => confirming && e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={confirming}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              if (confirming) {
                e.preventDefault();
                return;
              }
              // Keep the dialog open until the caller closes it themselves (e.g. after the async action settles).
              e.preventDefault();
              onConfirm();
            }}
            disabled={confirming}
            className={cn(
              "gap-2",
              variant === "destructive" &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
          >
            {confirming && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {confirming ? confirmingText : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
