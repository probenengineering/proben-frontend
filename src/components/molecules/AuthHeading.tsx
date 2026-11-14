import { TextLink } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Title plus a one-line prompt, optionally followed by a link, e.g. "You're new here? Sign up".
export interface AuthHeadingProps {
  title: string;
  prompt: string;
  /** Link after the prompt. Leave both out for a plain subtitle. */
  linkLabel?: string;
  linkHref?: string;
  /** Extra classes for the prompt line, e.g. a max width so it wraps like Figma. */
  promptClassName?: string;
}

export function AuthHeading({
  title,
  prompt,
  linkLabel,
  linkHref,
  promptClassName,
}: AuthHeadingProps) {
  return (
    <div className="flex w-full flex-col items-center gap-3 text-center">
      <h1 className="type-title-lg font-medium text-black">{title}</h1>
      <p className={cn("flex gap-1 type-title-sm text-black-60", promptClassName)}>
        {prompt}
        {linkLabel && linkHref && (
          <TextLink variant="brand" href={linkHref}>
            {linkLabel}
          </TextLink>
        )}
      </p>
    </div>
  );
}
