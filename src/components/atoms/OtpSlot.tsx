import { InputOTPSlot } from "@/components/ui";

// One code box. Figma shows only the empty state (56px tall, white-500 border, 12px radius).
// Active box and typed character follow the sign-in inputs: green-500 border, heading-sm text in grey-900.
// Letters always show in uppercase, matching the emailed code.
export interface OtpSlotProps {
  index: number;
}

export function OtpSlot({ index }: OtpSlotProps) {
  return (
    <InputOTPSlot
      index={index}
      className="h-14 w-auto min-w-0 flex-1 rounded-[12px] border border-white-500 type-heading-sm font-medium text-grey-900 uppercase first:rounded-[12px] first:border last:rounded-[12px] data-[active=true]:border-green-500 data-[active=true]:ring-0"
    />
  );
}
