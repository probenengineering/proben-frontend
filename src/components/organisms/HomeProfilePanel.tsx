import Image from "next/image";
import Link from "next/link";

import { Icon, Separator } from "@/components/atoms";
import { CopyButton, ProfileRow, ProfileSection } from "@/components/molecules";
import type { AssignedHome } from "@/types/home";

import { MuteToggle } from "./MuteToggle";

// "Profile" panel (384px) for a selected home (Figma 51:12782), built from the chat profile
// panel's pieces: name and address, map, residents and open tasks, contact details with copy
// buttons, and a Notifications switch (on = this home's push is muted, saved to the API).
// The map is a placeholder image until a map provider is chosen. Figma's copy "Mute
// notifications for this conversation" is kept as designed.
export interface HomeProfilePanelProps {
  home: AssignedHome;
  closeHref: string;
}

export function HomeProfilePanel({ home, closeHref }: HomeProfilePanelProps) {
  return (
    <aside className="flex h-full w-full flex-col gap-4 overflow-y-auto bg-white-300 py-5 lg:w-96 lg:border-l lg:border-divider">
      <div className="flex flex-col gap-5">
        <div className="flex h-7.75 shrink-0 items-center justify-between px-5">
          <h2 className="type-paragraph-lg font-medium text-black">Profile</h2>
          <Link href={closeHref} scroll={false} aria-label="Close profile">
            <Icon name="close" size={24} />
          </Link>
        </div>
        <Separator />
      </div>

      <section className="flex flex-col gap-5 px-6">
        <div className="flex flex-col gap-3">
          <h3 className="type-title-lg font-medium text-black">{home.name}</h3>
          <p className="truncate type-paragraph-sm text-grey-700">{home.address}</p>
        </div>
        <div className="relative h-37.5 w-full overflow-hidden rounded-[20px]">
          <Image
            src="/images/map-placeholder.png"
            alt={`Map placeholder for ${home.name}`}
            fill
            sizes="335px"
            className="object-cover"
          />
          <Icon
            name="location-bold"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      </section>
      <Separator />

      <ProfileSection>
        <div className="flex flex-col gap-2.25">
          <ProfileRow
            icon="profile-2user"
            title={`${home.residents ?? "—"} Residents`}
            className="py-2"
          />
          <ProfileRow
            icon="task-square"
            title={`${home.openTasks} open task${home.openTasks === 1 ? "" : "s"}`}
            className="py-2"
          />
        </div>
      </ProfileSection>
      <Separator />

      {(home.email || home.phone) && (
        <>
          <ProfileSection title="Contact information">
            <div className="flex flex-col gap-2.25">
              {home.email && (
                <ProfileRow
                  boxed
                  icon="sms"
                  title={home.email}
                  trailing={<CopyButton text={home.email} label="Email" />}
                  className="py-2"
                />
              )}
              {home.phone && (
                <ProfileRow
                  boxed
                  icon="call-calling"
                  title={home.phone}
                  trailing={<CopyButton text={home.phone} label="Phone number" />}
                  className="py-2"
                />
              )}
            </div>
          </ProfileSection>
          <Separator />
        </>
      )}

      <ProfileSection>
        <ProfileRow
          boxed
          icon="notification-bing"
          title="Notifications"
          subtitle="Mute notifications for this conversation"
          trailing={<MuteToggle key={home.id} homeId={home.id} muted={home.notificationsMuted} />}
          className="py-2"
        />
      </ProfileSection>
    </aside>
  );
}
