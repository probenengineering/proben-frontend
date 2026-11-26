import { AppShell } from "@/components/templates";

// Every signed-in app page shares this shell, so the sidebar (user card, unread count) stays
// mounted while moving between pages instead of reloading and flickering on each navigation.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
