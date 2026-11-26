// Map data credit (required by the OpenStreetMap / OpenMapTiles licences): one line in the
// bottom-right corner, 10px slate-500 on a translucent white strip, with links.
const LINK = "hover:underline";

export function MapCredit() {
  return (
    <p className="pointer-events-auto absolute right-0 bottom-0 z-10 rounded-tl-[6px] bg-white/80 px-1.5 py-0.5 type-ui-10 text-slate-500">
      ©{" "}
      <a className={LINK} href="https://openfreemap.org" target="_blank" rel="noreferrer">
        OpenFreeMap
      </a>{" "}
      ·{" "}
      <a className={LINK} href="https://www.openmaptiles.org" target="_blank" rel="noreferrer">
        OpenMapTiles
      </a>{" "}
      ·{" "}
      <a
        className={LINK}
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
      >
        OpenStreetMap
      </a>
    </p>
  );
}
