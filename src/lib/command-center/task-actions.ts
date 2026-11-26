"use server";

import { apiBase, errorMessage } from "@/lib/auth/api";
import { getAccessToken } from "@/lib/auth/session";
import type { TaskAnswers } from "@/types/task-table";

import { commandCenter } from "./api";
import type { ApiTask } from "./types";

// Task actions for the My tasks drawer. Every write takes the task's optimistic-lock `version`
// and returns the new one. Start: POST /tasks/{id}/start. Draft: PATCH /tasks/{id}/draft
// ({ answers, attachments }). Submit: POST /tasks/{id}/submit (validates the saved draft).

export type TaskResult = { ok: true; version: number } | { ok: false; error: string };

const path = (id: string) => `/tasks/${encodeURIComponent(String(id))}`;
const next = (task: ApiTask | undefined, version: number) => task?.version ?? version + 1;

export async function startTaskAction(id: string, version: number): Promise<TaskResult> {
  try {
    const task = await commandCenter<ApiTask>(`${path(id)}/start`, {
      method: "POST",
      body: { version },
    });
    return { ok: true, version: next(task, version) };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function saveDraftAction(
  id: string,
  version: number,
  answers: TaskAnswers,
  attachments: string[],
): Promise<TaskResult> {
  try {
    const task = await commandCenter<ApiTask>(`${path(id)}/draft`, {
      method: "PATCH",
      body: { version, answers, attachments },
    });
    return { ok: true, version: next(task, version) };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

/** Submit; an upcoming task is started first (simple tasks with no form fields). */
export async function submitTaskAction(
  id: string,
  version: number,
  started: boolean,
): Promise<TaskResult> {
  let current = version;
  if (!started) {
    const result = await startTaskAction(id, current);
    if (!result.ok) return result;
    current = result.version;
  }
  try {
    const task = await commandCenter<ApiTask>(`${path(id)}/submit`, {
      method: "POST",
      body: { version: current },
    });
    return { ok: true, version: next(task, current) };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export interface FileInfo {
  id: string;
  name: string;
  size?: number;
  /** Its details couldn't be loaded (Figma 60:12284: "Unavailable — we couldn't load this file."). */
  unavailable?: boolean;
}

/** Names and sizes for uploaded files (GET /api/files/{id}); unknown files keep a generic name. */
export async function getFilesAction(ids: string[]): Promise<FileInfo[]> {
  const accessToken = await getAccessToken();
  if (!accessToken) return [];
  return Promise.all(
    ids.map(async (id) => {
      try {
        const res = await fetch(`${apiBase()}/api/files/${encodeURIComponent(id)}`, {
          headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" },
          cache: "no-store",
          signal: AbortSignal.timeout(15_000),
        });
        if (!res.ok) return { id, name: "Attachment", unavailable: true };
        const data = await res.json();
        return {
          id,
          name: data.name ?? data.filename ?? data.originalName ?? "Attachment",
          size: data.size ?? data.sizeBytes,
        };
      } catch {
        return { id, name: "Attachment", unavailable: true };
      }
    }),
  );
}
