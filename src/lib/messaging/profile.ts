import "server-only";

import { request } from "@/lib/auth/api";
import { getAccessToken } from "@/lib/auth/session";

import { messaging } from "./api";
import { fileHref } from "./mappers";
import type { ApiConversation } from "./types";

// What the profile panel beside a direct chat shows: the other person (identity directory) and
// files shared in the chat. GET /directory/staff/{id}'s response isn't documented yet, so fields are
// read defensively (assumed to match the staff profile: displayName, jobTitle, email, homes).

interface DirectoryStaff {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string | null;
  email?: string;
  departmentName?: string | null;
  homes?: { name?: string }[];
}

interface SharedFile {
  fileId: string;
  name: string;
  sizeBytes: number;
  sentAt: string;
}

export interface Profile {
  name: string;
  role?: string;
  branch?: string;
  email?: string;
  homes: string[];
  files: { id: string; name: string; subtitle: string; href: string }[];
  muted: boolean;
}

const size = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1048576).toFixed(1)} MB`;
const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export async function loadProfile(
  conversation: ApiConversation,
  meId: string,
  fallbackName: string,
): Promise<Profile> {
  const otherId = conversation.participants.find((id) => id !== meId);
  const accessToken = await getAccessToken();
  const [person, files] = await Promise.all([
    otherId && conversation.type === "direct"
      ? request<DirectoryStaff>(`/api/identity/directory/staff/${encodeURIComponent(otherId)}`, {
          accessToken,
        }).catch(() => null)
      : null,
    messaging<{ items: SharedFile[] }>(
      `/conversations/${encodeURIComponent(conversation.id)}/files?limit=20`,
    ).catch(() => ({ items: [] as SharedFile[] })),
  ]);
  const homes = (person?.homes ?? []).map((home) => home.name ?? "").filter(Boolean);
  return {
    name:
      person?.displayName ||
      [person?.firstName, person?.lastName].filter(Boolean).join(" ") ||
      fallbackName,
    role: person?.jobTitle ?? undefined,
    branch: person?.departmentName ?? homes[0],
    email: person?.email,
    homes,
    files: files.items.map((file) => ({
      id: file.fileId,
      name: file.name,
      subtitle: `${size(file.sizeBytes)} • ${date(file.sentAt)}`,
      href: fileHref(file.fileId, file.name),
    })),
    muted: conversation.muted,
  };
}
