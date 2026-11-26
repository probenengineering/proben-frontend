import { Appear } from "@/components/atoms";

// Re-mounts on each navigation (unlike the layout), so the page content fades in while the
// sidebar stays still.
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <Appear className="flex min-h-0 w-full flex-1 flex-col">{children}</Appear>;
}
