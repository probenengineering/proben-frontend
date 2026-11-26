// Global search (Figma 60:14989 – 60:15643): results from GET /search, grouped by scope.

export type SearchScope = "all" | "people" | "messages" | "homes" | "tasks" | "schedule" | "files";

/** Tile behind a result's icon (12% of the colour). */
export type SearchTone = "grey" | "green" | "amber" | "blue" | "sky" | "purple" | "emerald";

export interface SearchItem {
  id: string;
  scope: Exclude<SearchScope, "all">;
  title: string;
  /** "Direct message · “I have been able to get it done”". */
  detail?: string;
  /** "3m", "Yesterday", "Active". */
  meta?: string;
  href: string;
  /** Initials avatar (people, chats); otherwise an icon. */
  initials?: string;
  icon?: "home" | "schedule" | "message" | "tasks" | "recent";
  tone: SearchTone;
}

export interface SearchResults {
  query: string;
  items: SearchItem[];
  error?: string;
}

export interface QuickAction {
  id: "clock-in" | "tasks" | "shifts" | "message";
  title: string;
  detail: string;
  href: string;
  /** "⌥ C". */
  shortcut?: string;
}
