import Image from "next/image";

import { Icon } from "@/components/atoms";
import { SidebarMenuItem } from "@/components/molecules";

// Decorative preview of the app shown beside the sign-up form on desktop (Figma node 1:6096).
// Static for now: the greeting is the Figma sample text, not the names typed in the form.
// Radii (32px, 28px, 24px) are one-off Figma values; there are no radius tokens yet.
export function AppPreview() {
  return (
    <div
      aria-hidden
      className="flex h-191 w-177.5 items-start gap-2.5 overflow-clip rounded-l-[32px] border border-white bg-linear-to-l from-white to-white-50/98 p-1"
    >
      <div className="relative flex h-full w-63.75 shrink-0 flex-col gap-10 overflow-clip rounded-[28px] bg-white-200 p-4">
        <div className="flex h-7.75 items-center gap-2.5">
          <Image src="/images/proben-avatar.png" alt="" width={31} height={31} />
          <span className="type-title-sm font-medium text-black">ProBen Inc.</span>
        </div>

        <div className="flex w-55.75 flex-col gap-3 px-2">
          <div className="flex flex-col gap-1">
            <SidebarMenuItem icon="home" label="Home" active />
            <SidebarMenuItem icon="messages" label="Messages" badge="10" />
            <SidebarMenuItem icon="grid" label="Staffer" trailing={<Icon name="chevron-down" />} />
            <SidebarMenuItem icon="notification" label="Notifications" />
            <SidebarMenuItem icon="user" label="Profile" />
          </div>
          <div className="h-px w-full bg-grey-100" />
        </div>

        {/* Placeholder user row at the bottom. Figma bar colour is #D9D9D9; white-700 is the agreed nearest token. */}
        <Image
          src="/images/preview-avatar-placeholder.svg"
          alt=""
          width={24}
          height={24}
          className="absolute bottom-5 left-4"
        />
        <div className="absolute bottom-7.25 left-13 h-2.5 w-24 rounded-[24px] bg-white-700/50" />
      </div>

      <div className="flex min-w-0 flex-1 items-center px-3 py-4">
        <p className="type-title-sm font-medium text-black">Hello, Ozenua Oluwatobi</p>
      </div>
    </div>
  );
}
