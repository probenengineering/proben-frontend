import { Icon } from "@/components/atoms";
import { cn } from "@/lib/utils";

// Text options inside a dropdown, e.g. "No grouping / Focus" or "Newest / Oldest / Priority".
// compact: 28px rows (Ordering) instead of 36px. showCheck: ✓ beside the chosen option.
export interface ChoiceListProps {
  options: string[];
  value?: string;
  onSelect?: (option: string) => void;
  compact?: boolean;
  showCheck?: boolean;
}

export function ChoiceList({ options, value, onSelect, compact, showCheck }: ChoiceListProps) {
  return (
    <div role="listbox" className={cn("flex flex-col px-2", !compact && "gap-1")}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="option"
          aria-selected={option === value}
          onClick={() => onSelect?.(option)}
          className={cn(
            "flex w-full items-center gap-1 text-left type-paragraph-sm font-medium text-grey-900",
            compact ? "py-1" : "py-2",
          )}
        >
          <span className="min-w-0 flex-1">{option}</span>
          {showCheck && option === value && <Icon name="check" size={16} />}
        </button>
      ))}
    </div>
  );
}
