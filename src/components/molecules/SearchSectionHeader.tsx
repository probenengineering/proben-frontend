// Group heading in the search panel (Figma "Group / People" 60:15118): 10px sides, 10px top, 4px
// bottom; Inter Semi Bold 11/16 uppercase grey-400, and an optional action on the right (Semi Bold
// 12/16 green-ink: "Clear", "Show all 3").
export interface SearchSectionHeaderProps {
  title: string;
  action?: { label: string; onClick: () => void };
}

export function SearchSectionHeader({ title, action }: SearchSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2.5 pt-2.5 pb-1">
      <span className="type-ui-11-16 font-semibold tracking-wide text-grey-400 uppercase">
        {title}
      </span>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="type-ui-12-16 font-semibold text-green-ink hover:underline"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
