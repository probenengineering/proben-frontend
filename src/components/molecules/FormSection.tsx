import type { ReactNode } from "react";

// A section of the Add staff form (Figma "Section / Personal information" 103:18671): a 300px
// intro (title Inter Semi Bold 16/23 slate-900 over a 13/18 slate-500 description, plus `extra`
// such as the photo upload) beside a white card (slate-200 border, 16px radius, 20px padding,
// 16px between rows); 24px apart. Phones and tablets: the intro sits above the card.
export interface FormSectionProps {
  title: string;
  description: string;
  extra?: ReactNode;
  children: ReactNode;
}

export function FormSection({ title, description, extra, children }: FormSectionProps) {
  return (
    <section className="flex w-full flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
      <div className="flex w-full shrink-0 flex-col gap-1 lg:w-75">
        <h2 className="type-ui-16-23 font-semibold text-slate-900">{title}</h2>
        <p className="type-ui-13 text-slate-500">{description}</p>
        {extra && <div className="pt-0.5">{extra}</div>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-[16px] border border-slate-200 bg-white p-5">
        {children}
      </div>
    </section>
  );
}
