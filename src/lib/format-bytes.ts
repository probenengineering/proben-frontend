/** "240 KB" / "1.2 MB" for a byte count; undefined when unknown. */
export function formatBytes(bytes?: number) {
  if (bytes === undefined) return undefined;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
