import { Suspense } from "react";

import { PageHeading } from "@/components/molecules";
import { FlatPageTemplate } from "@/components/templates/FlatPageTemplate";
import { getNotifications } from "@/lib/notifications";

import { ContentSkeleton } from "./ContentSkeleton";
import { DashboardHeader } from "./DashboardHeader";
import { NotificationList } from "./NotificationList";

// Notifications page (Figma 51:11625). The header and heading show at once; the list streams in
// behind a skeleton, so the page never flashes blank.
export function NotificationsView() {
  return (
    <FlatPageTemplate
      header={<DashboardHeader wideSearch />}
      heading={<PageHeading title="Notifications" />}
    >
      <Suspense fallback={<ContentSkeleton label="Loading notifications" rows={6} />}>
        <NotificationsData />
      </Suspense>
    </FlatPageTemplate>
  );
}

async function NotificationsData() {
  const { notifications, error } = await getNotifications();
  return <NotificationList notifications={notifications} error={error} />;
}
