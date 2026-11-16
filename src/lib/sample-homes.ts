import type { AssignedHome } from "@/types/home";

// Sample My Homes data from the Figma "Section" frame (51:12625), until the API is wired up.

const contact = { email: "ozenua@gmail.com", phone: "+234 800 000 0000" };
const address = "12, Maryland Avenue, maryland,Lagos 100213.";

export const SAMPLE_HOMES: AssignedHome[] = [
  {
    id: "maryland",
    name: "Maryland Homes",
    address,
    residents: 12,
    openTasks: 3,
    nextSchedule: { day: "Today", time: "10:00AM" },
    ...contact,
  },
  {
    id: "landville",
    name: "Landville Homes",
    address,
    residents: 12,
    openTasks: 3,
    nextSchedule: { day: "Tomorrow", time: "10:00AM" },
    ...contact,
  },
  {
    id: "landville-2",
    name: "Landville Homes",
    address,
    residents: 12,
    openTasks: 3,
    nextSchedule: { day: "Nov 5, 2026", time: "10:00AM" },
    ...contact,
  },
  {
    id: "oakwood",
    name: "Oakwood Homes",
    address,
    residents: 12,
    openTasks: 3,
    nextSchedule: { day: "Nov 6, 2026", time: "10:00AM" },
    ...contact,
  },
];
