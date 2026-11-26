import type { Metadata } from "next";
import { Suspense } from "react";

import { ContentSkeleton, DashboardHeader, HomeDetail } from "@/components/organisms";
import { TasksTemplate } from "@/components/templates";

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
    <TasksTemplate header={<DashboardHeader />}>
      <Suspense fallback={<ContentSkeleton label="Loading home" rows={4} />}>
        <HomeDetailFor params={params} searchParams={searchParams} />
      </Suspense>
    </TasksTemplate>
  );
}

async function HomeDetailFor({ params, searchParams }: { params: Params; searchParams: Search }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const tab = TABS.find((t) => t === query.tab) ?? "overview";
  const day = typeof query.day === "string" ? query.day : undefined;
  return <HomeDetail id={id} tab={tab} day={day} />;
}
