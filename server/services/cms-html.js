import { getEntries } from './strapi.js';

let snippetCache = null;
let snippetCacheTime = 0;
const SNIPPET_CACHE_TTL = Number(process.env.SNIPPET_CACHE_TTL_SECS) * 1_000;

const RAW_HTML_OPEN = `<div class="raw-html-embed">`;
const RAW_HTML_CLOSE = `</div>`;

/**
 * Extract raw-html-embed blocks (handling nested divs) and replace with placeholders.
 */
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
 * Strip pasted <span> tags (keeping inner content) and trailing empty paragraphs
 * that CKEditor likes to leave behind. Preserves raw HTML embed blocks untouched.
 */
function sanitize(str) {
  const { result: safe, blocks } = extractRawBlocks(str);

  let cleaned = safe
    .replace(/<\/?span[^>]*>/gi, ``)
    .replace(/(<p>\s*(<br\s*\/?>|&nbsp;|\s)*<\/p>\s*)+$/gi, ``)
    .trim();

  return restoreRawBlocks(cleaned, blocks);
}

/**
 * Fetch all TextSnippets from Strapi and build a case-insensitive lookup map.
 */
async function getSnippetMap() {
  const now = Date.now();
  if (snippetCache && now - snippetCacheTime < SNIPPET_CACHE_TTL) {
    return snippetCache;
  }

  const result = await getEntries(`text-snippets`, { 'pagination[pageSize]': `100` });
  const map = new Map();
  const items = result?.data || [];
  for (const item of items) {
    if (item.Key) {
      map.set(item.Key.toLowerCase(), item.Value ?? ``);
    }
  }

  snippetCache = map;
  snippetCacheTime = now;
  return map;
}

const TOKEN_PATTERN = /\[{3}\s*(.+?)\s*]{3}/g;

/**
 * Replace [[[Key]]] tokens in a single string with TextSnippet values.
 */
async function substituteTokens(str, snippetMap) {
  const matches = [...str.matchAll(TOKEN_PATTERN)];
  if (matches.length === 0) return str;

  let result = str;
  for (const match of matches) {
    const fullMatch = match[0];
    const key = match[1].trim().toLowerCase();
    const value = snippetMap.get(key);

    if (value != null) {
      result = result.replace(fullMatch, value);
    } else {
      result = result.replace(
        fullMatch,
        `<strong style="color: #cc0000">Snippet Key &quot;${key}&quot; not found</strong>`,
      );
    }
  }

  return result;
}

/**
 * Recursively walk a value, applying sanitization and token substitution
 * to every string encountered.
 */
async function processValue(val, snippetMap) {
  if (typeof val === `string`) {
    return substituteTokens(sanitize(val), snippetMap);
  }
  if (Array.isArray(val)) {
    return Promise.all(val.map((item) => processValue(item, snippetMap)));
  }
  if (val !== null && typeof val === `object`) {
    const entries = Object.entries(val);
    const processed = await Promise.all(
      entries.map(async ([k, v]) => [k, await processValue(v, snippetMap)]),
    );
    return Object.fromEntries(processed);
  }
  return val;
}

/**
 * Sanitize HTML and replace snippet tokens in all string values of a Strapi response.
 */
export async function processStrapiResponse(data) {
  const snippetMap = await getSnippetMap();
  return processValue(data, snippetMap);
}
