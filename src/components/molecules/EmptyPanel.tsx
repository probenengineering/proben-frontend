// Dashed placeholder box for an empty dashboard section, e.g. "No schedule today".
// Figma (51:10133): 16px radius, 1px dashed white-300 border, 107px tall, 24px Inter Tight
// Medium text in black-20.
export interface EmptyPanelProps {
  message: string;
}

export function EmptyPanel({ message }: EmptyPanelProps) {
  return (
    <div className="flex h-27.25 w-full items-center justify-center rounded-[16px] border border-dashed border-white-300 bg-white px-4">
      <p className="text-center type-heading-sm font-medium text-black-20">{message}</p>
    </div>
  );
}
