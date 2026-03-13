/**
 * Strip <span> tags from CMS HTML, keeping their inner content.
 * CKEditor never generates spans — they come from pasted content.
 */
export function stripSpans(html) {
  if (!html) return html;
  return html.replace(/<\/?span[^>]*>/gi, ``);
}
