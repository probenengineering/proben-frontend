"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

import { EASE_OUT } from "@/components/atoms";
import { HOME_VIEWS, ViewToggle } from "@/components/molecules";
import type { AssignedHome } from "@/types/home";

import { HomeCard } from "./HomeCard";
import { HomesTable } from "./HomesTable";

// My Homes content on /homes: the heading row with the List / Section toggle, then the table
// (Figma 51:12496) or the cards (51:12625). The view switches in place, no route change.
// Rows and cards link to /homes?home=<id>, which opens the profile panel.
export interface HomesBrowserProps {
  homes: AssignedHome[];
  heading: ReactNode;
  /** The home whose profile panel is open. */
  selectedId?: string;
}

type HomesView = "list" | "section";

const hrefFor = (id: string) => `/homes?home=${encodeURIComponent(id)}`;

export function HomesBrowser({ homes, heading, selectedId }: HomesBrowserProps) {
  const [view, setView] = useState<HomesView>("list");

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {heading}
        <ViewToggle current={view} views={HOME_VIEWS} onChange={(id) => setView(id as HomesView)} />
      </div>
      {/* List ↔ Section crossfade. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
        >
          {view === "list" ? (
            <HomesTable
              homes={homes}
              hrefFor={hrefFor}
              selectedId={selectedId}
              compact={Boolean(selectedId)}
            />
          ) : (
            <div className={selectedId ? "grid gap-6" : "grid gap-6 xl:grid-cols-2"}>
              {homes.map((home) => (
                <HomeCard key={home.id} home={home} href={hrefFor(home.id)} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
