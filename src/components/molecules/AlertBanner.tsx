import { Icon } from "@/components/atoms";

// Error alert in the task form (Figma "Alert / Submission failed" 60:12026): danger-50 fill,
// danger-200 border, 12px radius, 14 × 12 padding, 10px gaps. 20px alert icon, title Inter Semi
// Bold 14/20 + message Inter 13/18, both danger-700.
export interface AlertBannerProps {
  title: string;
  message: string;
}

export function AlertBanner({ title, message }: AlertBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-[12px] border border-danger-200 bg-danger-50 px-3.5 py-3"
    >
      <Icon name="alert-error-20" size={20} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-danger-700">
        <p className="type-ui-14 font-semibold">{title}</p>
        <p className="type-ui-13">{message}</p>
      </div>
    </div>
  );
}
