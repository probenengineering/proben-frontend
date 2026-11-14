// Small grid of common emoji (not in Figma; agreed). Picking one calls onPick.
const EMOJIS = [
  "😀",
  "😂",
  "😊",
  "😍",
  "🙂",
  "😉",
  "😎",
  "😅",
  "😢",
  "😮",
  "🤔",
  "👀",
  "👍",
  "👏",
  "🙌",
  "🙏",
  "💪",
  "👌",
  "✅",
  "❤️",
  "🎉",
  "🔥",
  "💯",
  "✨",
];

export interface EmojiPickerProps {
  onPick: (emoji: string) => void;
}

export function EmojiPicker({ onPick }: EmojiPickerProps) {
  return (
    <div role="listbox" aria-label="Emoji" className="grid grid-cols-6 gap-1 p-1">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          role="option"
          aria-selected={false}
          onClick={() => onPick(emoji)}
          className="flex size-8 items-center justify-center rounded-md type-title-lg hover:bg-white-200"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
