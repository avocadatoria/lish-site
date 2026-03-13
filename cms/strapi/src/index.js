'use strict';

const RAW_HTML_OPEN = `<div class="raw-html-embed">`;
const RAW_HTML_CLOSE = `</div>`;

function extractRawBlocks(html) {
  const blocks = [];
  let result = html;
  let searchFrom = 0;

  while (true) {
    const openIdx = result.toLowerCase().indexOf(RAW_HTML_OPEN.toLowerCase(), searchFrom);
    if (openIdx === -1) break;

    let depth = 1;
    let cursor = openIdx + RAW_HTML_OPEN.length;

    while (depth > 0 && cursor < result.length) {
      const nextOpen = result.toLowerCase().indexOf(`<div`, cursor);
      const nextClose = result.toLowerCase().indexOf(`</div>`, cursor);

      if (nextClose === -1) break;

      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        cursor = nextOpen + 4;
      } else {
        depth--;
        if (depth === 0) {
          const blockEnd = nextClose + RAW_HTML_CLOSE.length;
          const block = result.slice(openIdx, blockEnd);
          blocks.push(block);
          const placeholder = `__RAW_HTML_${blocks.length - 1}__`;
          result = result.slice(0, openIdx) + placeholder + result.slice(blockEnd);
          searchFrom = openIdx + placeholder.length;
        } else {
          cursor = nextClose + RAW_HTML_CLOSE.length;
        }
      }
    }
  }

  return { result, blocks };
}

function restoreRawBlocks(html, blocks) {
  let result = html;
  for (let i = 0; i < blocks.length; i++) {
    result = result.replace(`__RAW_HTML_${i}__`, blocks[i]);
  }
  return result;
}

/**
 * Sanitize CKEditor HTML: strip pasted <span> tags and trailing empty paragraphs.
 * Preserves raw HTML embed blocks untouched.
 */
function sanitizeCmsHtml(html) {
  if (!html) return html;

  const { result: safe, blocks } = extractRawBlocks(html);

  let cleaned = safe
    .replace(/<\/?span[^>]*>/gi, ``)
    .replace(/(<p>\s*(<br\s*\/?>|&nbsp;|\s)*<\/p>\s*)+$/gi, ``)
    .trim();

  return restoreRawBlocks(cleaned, blocks);
}

/**
 * Return the attribute names that use the CKEditor custom field for a given content type UID.
 */
function getCKEditorFields(strapi, uid) {
  const model = strapi.contentTypes[uid];
  if (!model) return [];
  return Object.entries(model.attributes)
    .filter(([, attr]) => attr.type === `customField` && attr.customField === `plugin::ckeditor5.CKEditor`)
    .map(([name]) => name);
}

module.exports = {
  register({ strapi }) {
    strapi.documents.use(async (context, next) => {
      if (context.action !== `create` && context.action !== `update`) {
        return next();
      }

      const data = context.params?.data;
      if (!data) return next();

      const fields = getCKEditorFields(strapi, context.uid);
      for (const field of fields) {
        if (data[field] != null) {
          data[field] = sanitizeCmsHtml(data[field]);
        }
      }

      // Derive EmbedCode from Key for TextSnippets
      if (context.uid === `api::text-snippet.text-snippet` && data.Key) {
        data.EmbedCode = `[[[${data.Key}]]]`;
      }

      return next();
    });
  },
  bootstrap(/*{ strapi }*/) {},
};
