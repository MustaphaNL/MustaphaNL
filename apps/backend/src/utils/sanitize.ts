/**
 * HTML-escape user input to prevent XSS in email templates and responses.
 * Escapes &, <, >, ", ', / characters.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strip all HTML tags from a string (for plain-text contexts).
 */
export function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize a string: strip tags and trim whitespace.
 * Use for user-supplied text fields before DB storage.
 */
export function sanitizeText(input: string): string {
  return stripTags(input).trim();
}

/**
 * Validate that a file's MIME type matches allowed image types.
 * Check both the declared MIME type and file extension.
 */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
]);

export function isAllowedImageFile(file: { mimetype: string; originalname: string }): boolean {
  const ext = file.originalname.toLowerCase().match(/\.[^.]+$/)?.[0] || '';
  return ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext);
}

/**
 * Validate an integer parameter falls within bounds.
 */
export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}
