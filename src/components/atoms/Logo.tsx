import Image from "next/image";

import { cn } from "@/lib/utils";

// The logo file is the full "Proben Medical Consult" lockup.
// "mark" (auth screens): only the green P+ mark (37x40), cropped like Figma.
// "compact" (collapsed sidebar): a smaller crop of the mark (28x34), centred in a 40px row.
// "full" (app sidebar): the whole lockup at 110x32, 1px above centre in a 40px row like Figma.
export interface LogoProps {
  variant?: "mark" | "compact" | "full";
  className?: string;
}

export function Logo({ variant = "mark", className }: LogoProps) {
  if (variant === "full") {
    return (
      <span className={cn("flex h-10 items-center", className)}>
        <Image
          src="/images/proben-logo.png"
          alt="Proben"
          width={110}
          height={32}
          priority
          className="h-8 w-27.5 -translate-y-px object-cover"
        />
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span className={cn("flex h-10 w-full items-center justify-center", className)}>
        <span className="relative h-8.5 w-7 translate-y-px overflow-hidden">
          <Image
            src="/images/proben-logo.png"
            alt="Proben"
            width={115}
            height={34}
            priority
            className="h-[98.52%] w-auto max-w-none"
          />
        </span>
      </span>
    );
  }

  return (
    <span className={cn("relative block h-10 w-9.25 overflow-hidden", className)}>
      <Image
        src="/images/proben-logo.png"
        alt="Proben"
        width={137}
        height={40}
        priority
        className="h-full w-auto max-w-none"
      />
    </span>
  );
}
