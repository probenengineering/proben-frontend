// "Loading map…" card centred on the homes map (Figma "Loading map" 60:13788): white, 16px radius,
// 28 × 22 padding, 10px gaps, map-overlay shadow. A 32px green-500 three-quarter ring spinning,
// "Loading map…" (Inter Semi Bold 14/20 slate-900) and "Placing your assigned homes" (12/18
// slate-500).
export function MapLoadingCard() {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-2.5 rounded-[16px] bg-white px-7 py-5.5 text-center shadow-map-overlay"
    >
      <span
        aria-hidden
        className="size-8 animate-spin rounded-full border-[3.2px] border-green-500 border-t-transparent"
      />
      <span className="flex flex-col">
        <span className="type-ui-14 font-semibold text-slate-900">Loading map…</span>
        <span className="type-ui-12 text-slate-500">Placing your assigned homes</span>
      </span>
    </div>
  );
}
