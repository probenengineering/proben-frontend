// A care home assigned to the signed-in caregiver (My Homes tab, Figma 51:12496 / 51:12625).
// Shape matches the proposed API in docs/command-center.md §4.
export interface AssignedHome {
  id: string;
  name: string;
  /** One line, e.g. "12, Maryland Avenue, maryland,Lagos 100213." */
  address: string;
  residents: number;
  openTasks: number;
  /** Next shift at this home: day ("Today", "Tomorrow", "Nov 5, 2026") and time ("10:00AM"). */
  nextSchedule: { day: string; time: string } | null;
  email?: string;
  phone?: string;
  /** For the map; the backend will send these. Until then the panel shows a placeholder map. */
  coordinates?: { lat: number; lng: number };
}
