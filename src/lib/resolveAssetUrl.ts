/**
 * Resolve a stored RELATIVE asset path (e.g. "audio/Artist - Album/1.Title.mp3" or
 * "audio/.../cover.webp") against the deploy base path, URL-encoding it so paths with
 * spaces, commas, apostrophes, or unicode (e.g. "…") load correctly.
 *
 * `encodeURI` keeps URL-safe separators (`/ , '`) and encodes only the unsafe bits
 * (space → %20, "…" → %E2%80%A6). Stored paths are RAW, so this encodes exactly once.
 * The base path (e.g. "/Vinyl-Player/") has no special chars and is left untouched.
 */
export function resolveAssetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${encodeURI(path.replace(/^\//, ''))}`;
}
