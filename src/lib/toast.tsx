import { toast } from "sonner";

import { Toast, type ToastProps } from "@/components/molecules";

// Show an error or success toast at the bottom centre. Call from client components,
// e.g. showToast("error", "This email is not recognised, sign up to create an account").
export function showToast(variant: ToastProps["variant"], message: string) {
  return toast.custom(() => <Toast variant={variant} message={message} />);
}
