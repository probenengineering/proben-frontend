import { toast } from "sonner";

import { ActionToast, Toast, type ToastProps } from "@/components/molecules";

// Show an error or success toast at the bottom centre. Call from client components,
// e.g. showToast("error", "This email is not recognised, sign up to create an account").
export function showToast(variant: ToastProps["variant"], message: string) {
  return toast.custom(() => <Toast variant={variant} message={message} />);
}

/** Dark toast with an action, e.g. showActionToast("X moved to Finished", "View", openCompleted). */
export function showActionToast(message: string, actionLabel?: string, onAction?: () => void) {
  return toast.custom((id) => (
    <ActionToast
      message={message}
      actionLabel={actionLabel}
      onAction={
        onAction &&
        (() => {
          onAction();
          toast.dismiss(id);
        })
      }
    />
  ));
}
