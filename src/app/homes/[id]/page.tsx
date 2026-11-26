import type { Metadata } from "next";
import { Suspense } from "react";

import { DashboardHeader, HomeDetail } from "@/components/organisms";
import { AppShell, TasksTemplate } from "@/components/templates";

export const metadata: Metadata = {
  title: "Home | Proben",
};

// A home's page, Overview tab (Figma 60:13792).
type Params = Promise<{ id: string }>;
type Search = Promise<{ tab?: string | string[]; day?: string | string[] }>;

const TABS = ["overview", "team", "schedule", "updates", "resources"] as const;

// ?tab=team|schedule|updates|resources (Figma 60:13930, 60:14124, 60:14244, 60:14528); ?day=
// picks the schedule day.
export default async function HomePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  return (
    <AppShell activeNav="home">
      <TasksTemplate header={<DashboardHeader />}>
        <Suspense>
          <HomeDetailFor params={params} searchParams={searchParams} />
        </Suspense>
      </TasksTemplate>
    </AppShell>
  );
}

async function HomeDetailFor({ params, searchParams }: { params: Params; searchParams: Search }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const tab = TABS.find((t) => t === query.tab) ?? "overview";
  const day = typeof query.day === "string" ? query.day : undefined;
  return <HomeDetail id={id} tab={tab} day={day} />;
}
