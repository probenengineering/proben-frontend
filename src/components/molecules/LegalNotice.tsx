import { TextLink } from "@/components/atoms";
import { cn } from "@/lib/utils";

// "By signing in/up, you agree to the Terms of Service and Privacy Policy" line under auth forms.
export interface LegalNoticeProps {
  action: "signing in" | "signing up";
  /** Use a max width to make it wrap like Figma. */
  className?: string;
}

export function LegalNotice({ action, className }: LegalNoticeProps) {
  return (
    <p className={cn("text-center type-title-sm text-black-50", className)}>
      By {action}, you agree to the{" "}
      <TextLink href="#" variant="underline">
        Terms of Service
      </TextLink>{" "}
      and{" "}
      <TextLink href="#" variant="underline">
        Privacy Policy
      </TextLink>
    </p>
  );
}
