import { Icon } from "@/components/atoms";

// Map zoom buttons (Figma "Zoom controls" 60:13429): 40px wide, white, 12px radius, map-overlay
// shadow; three 40px buttons (zoom in, zoom out, fit to homes) with slate-200 dividers.
export interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

export function MapControls({ onZoomIn, onZoomOut, onFit }: MapControlsProps) {
  const buttons = [
    { icon: "zoom-in-16", label: "Zoom in", onClick: onZoomIn },
    { icon: "zoom-out-16", label: "Zoom out", onClick: onZoomOut },
    { icon: "fit-16", label: "Fit to homes", onClick: onFit },
  ] as const;
  return (
    <div className="flex w-10 flex-col overflow-clip rounded-[12px] bg-white shadow-map-overlay">
      {buttons.map((b, i) => (
        <button
          key={b.icon}
          type="button"
          aria-label={b.label}
          onClick={b.onClick}
          className={`flex size-10 items-center justify-center hover:bg-slate-50 ${i < 2 ? "border-b border-slate-200" : ""}`}
        >
          <Icon name={b.icon} size={16} />
        </button>
      ))}
    </div>
  );
}
