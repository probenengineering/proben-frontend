import { PageHeading } from "@/components/molecules";
import { FlatPageTemplate } from "@/components/templates/FlatPageTemplate";
import { getNotifications } from "@/lib/notifications";

import { DashboardHeader } from "./DashboardHeader";
import { NotificationList } from "./NotificationList";

// Notifications page (Figma 51:11625). Loaded as a whole (the app layout shows the first-visit
// loading state), so arriving from another page keeps that page until this one is ready.
export async function NotificationsView() {
  const { notifications, error } = await getNotifications();
  return (
    <FlatPageTemplate
      header={<DashboardHeader wideSearch />}
      heading={<PageHeading title="Notifications" />}
    >
      <NotificationList notifications={notifications} error={error} />
    </FlatPageTemplate>
  );
}
