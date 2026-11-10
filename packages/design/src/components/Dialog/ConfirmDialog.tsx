import { Button } from "../Button/Button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./Dialog.tsx";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** The confirm button's label. Name the action ("Decommission"), not "OK". */
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button, for actions that lose data. */
  destructive?: boolean;
  /** Keeps the dialog open with a spinner on the confirm button while the action runs. */
  loading?: boolean;
  onConfirm: () => void;
}

/**
 * A yes/no question before an action. AuroraBoot's ConfirmDialog, with a
 * loading state so a slow action can keep the dialog open until it is done:
 * with `loading` unset the dialog closes as soon as the user confirms.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading,
  onConfirm,
}: ConfirmDialogProps) {
  const managed = loading !== undefined;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            loading={loading}
            onClick={() => {
              onConfirm();
              if (!managed) onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
