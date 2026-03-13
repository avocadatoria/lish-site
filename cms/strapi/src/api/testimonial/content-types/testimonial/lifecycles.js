/**
 * Strip HTML tags and decode common entities to produce plaintext.
 */
function htmlToPlaintext(html) {
  if (!html) return ``;
  const plain = html
    .replace(/<br\s*\/?>/gi, `\n`)
    .replace(/<\/p>/gi, `\n`)
    .replace(/<[^>]+>/g, ``)
    .replace(/&amp;/g, `&`)
    .replace(/&lt;/g, `<`)
    .replace(/&gt;/g, `>`)
    .replace(/&quot;/g, `"`)
    .replace(/&#039;/g, `'`)
    .replace(/&nbsp;/g, ` `)
    .replace(/\n{3,}/g, `\n\n`)
    .replace(/\s+/g, ` `)
    .trim();
  return plain.length > 64 ? `${plain.slice(0, 64)}...` : plain;
}

export default {
  beforeCreate(event) {
    const { data } = event.params;
    if (data.Content != null) {
      data.DerivedContentPlaintext = htmlToPlaintext(data.Content);
    }
  },

  beforeUpdate(event) {
    const { data } = event.params;
    if (data.Content != null) {
      data.DerivedContentPlaintext = htmlToPlaintext(data.Content);
    }
  },
};
