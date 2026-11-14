import Link from "next/link";

import { Icon, Separator } from "@/components/atoms";
import { CopyButton, ProfileRow, ProfileSection, ProfileSummary } from "@/components/molecules";

import { MuteToggle } from "./MuteToggle";

// Figma: "Profile" panel (384px) beside an open chat: the other person, their homes, files shared
// in the chat and their email. Sections with nothing to show are left out.
// ✕ closes the panel, files download, the email copies, and Notifications mutes this chat.
// Home rows have nowhere to go yet (no home screen).
export interface ProfilePanelProps {
  closeHref: string;
  name: string;
  initials?: string;
  role?: string;
  branch?: string;
  email?: string;
  homes?: string[];
  /** href downloads the file. */
  files?: { id: string; name: string; subtitle: string; href?: string }[];
  /** The open chat, for the Notifications (mute) switch. */
  conversationId?: string;
  muted?: boolean;
}

const homeArrow = <Icon name="arrow-right" size={16} />;

function DownloadIcon() {
  // Figma: a 17x14 icon centred in a 20x16 slot.
  return (
    <span className="flex h-4 w-5 items-center justify-center">
      <Icon name="download" size={17} height={14} />
    </span>
  );
}

export function ProfilePanel({
  closeHref,
  name,
  initials,
  role,
  branch,
  email,
  homes = [],
  files = [],
  conversationId,
  muted = false,
}: ProfilePanelProps) {
  return (
    <aside className="flex h-full w-full flex-col gap-4 overflow-y-auto py-5 lg:w-96 lg:border-l lg:border-divider">
      <div className="flex flex-col gap-5">
        <div className="flex h-7.75 shrink-0 items-center justify-between px-5">
          <h2 className="type-paragraph-lg font-medium text-black">Profile</h2>
          <Link href={closeHref} aria-label="Close profile">
            <Icon name="close" size={24} />
          </Link>
        </div>
        <Separator />
      </div>

      <ProfileSummary name={name} initials={initials} role={role} branch={branch} />
      <Separator />

      {homes.length > 0 && (
        <>
          <ProfileSection title="Assigned Homes">
            {/* Figma rows are 352px, slightly wider than the 335px column. */}
            <div className="flex flex-col gap-2.25">
              {homes.map((home) => (
                <ProfileRow
                  key={home}
                  icon="hospital"
                  title={home}
                  trailing={homeArrow}
                  className="w-full py-2 lg:w-88"
                />
              ))}
            </div>
          </ProfileSection>
          <Separator />
        </>
      )}

      {files.length > 0 && (
        <>
          <ProfileSection title="Shared files">
            <div className="flex flex-col gap-4 py-3">
              {files.map((file, index) => (
                <div key={file.id} className="flex flex-col gap-4">
                  {index > 0 && <Separator />}
                  <ProfileRow
                    icon="document-text"
                    title={file.name}
                    subtitle={file.subtitle}
                    trailing={
                      file.href ? (
                        <a
                          href={file.href}
                          download={file.name}
                          aria-label={`Download ${file.name}`}
                          className="flex"
                        >
                          <DownloadIcon />
                        </a>
                      ) : (
                        <DownloadIcon />
                      )
                    }
                    boxed
                  />
                </div>
              ))}
            </div>
          </ProfileSection>
          <Separator />
        </>
      )}

      {email && (
        <>
          <ProfileSection title="Contact information">
            <ProfileRow
              boxed
              icon="sms"
              title={email}
              trailing={<CopyButton text={email} label="Email" />}
              className="py-2"
            />
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
          trailing={
            conversationId ? (
              <MuteToggle conversationId={conversationId} muted={muted} />
            ) : (
              <Icon name="toggle-on" size={16} />
            )
          }
          className="py-2"
        />
      </ProfileSection>
    </aside>
  );
}
