import type { ReactNode } from "react";

// A form page inside the AppShell card (Add staff 103:18646): the header, then the form, which
// scrolls its own fields and keeps its action bar pinned at the bottom of the card.
export interface FormPageTemplateProps {
  header: ReactNode;
  children: ReactNode;
}

export function FormPageTemplate({ header, children }: FormPageTemplateProps) {
  return (
    <>
      {header}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </>
  );
}
