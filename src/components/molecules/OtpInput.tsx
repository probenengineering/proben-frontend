import { OtpSlot } from "@/components/atoms";
import { InputOTP, InputOTPGroup } from "@/components/ui";

// Same as input-otp's REGEXP_ONLY_DIGITS_AND_CHARS. Importing the package here would pull client-only code into a server file.
// Backend codes are 6 characters of uppercase letters and digits (e.g. GFE2XQ).
const LETTERS_AND_DIGITS = "^[a-zA-Z0-9]+$";

// 6-character code: 3 boxes, a 12px dash, 3 boxes. Handles typing, paste and moving between boxes.
// Letters show and are sent in uppercase, whatever case was typed or pasted.
export interface OtpInputProps {
  id?: string;
  "aria-label"?: string;
  /** Called with the uppercased code once all 6 characters are entered. */
  onComplete?: (code: string) => void;
}

export function OtpInput({ onComplete, ...props }: OtpInputProps) {
  return (
    <InputOTP
      maxLength={6}
      pattern={LETTERS_AND_DIGITS}
      inputMode="text"
      autoCapitalize="characters"
      autoComplete="one-time-code"
      pasteTransformer={(pasted) => pasted.replace(/[\s-]/g, "")}
      onComplete={(code: string) => onComplete?.(code.toUpperCase())}
      containerClassName="w-full gap-2"
      {...props}
    >
      <InputOTPGroup className="flex-1 gap-2">
        <OtpSlot index={0} />
        <OtpSlot index={1} />
        <OtpSlot index={2} />
      </InputOTPGroup>
      <div role="separator" className="h-px w-3 shrink-0 bg-white-500" />
      <InputOTPGroup className="flex-1 gap-2">
        <OtpSlot index={3} />
        <OtpSlot index={4} />
        <OtpSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}
