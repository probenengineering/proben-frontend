// Page title (Inter Tight Medium 22px) with a grey 14px description underneath, e.g. "My task".
export interface PageHeadingProps {
  title: string;
  description?: string;
}

export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <div className="flex flex-col justify-center gap-3">
      <h1 className="type-title-lg font-medium whitespace-nowrap text-black">{title}</h1>
      {description && <p className="type-paragraph-sm text-black-60">{description}</p>}
    </div>
  );
}
