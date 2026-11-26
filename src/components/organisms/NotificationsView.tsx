import { PageHeading } from "@/components/molecules";
import { FlatPageTemplate } from "@/components/templates/FlatPageTemplate";
import { getNotifications } from "@/lib/notifications";

import { DashboardHeader } from "./DashboardHeader";
import { NotificationList } from "./NotificationList";

// Notifications page (Figma 51:11625). Reads the session, so render it inside <Suspense>.
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
