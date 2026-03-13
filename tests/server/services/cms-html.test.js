import { describe, it, expect } from 'vitest';

// Test the sanitize logic directly — extract it for testing
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

function sanitize(str) {
  const { result: safe, blocks } = extractRawBlocks(str);

  let cleaned = safe
    .replace(/<\/?span[^>]*>/gi, ``)
    .replace(/(<p>\s*(<br\s*\/?>|&nbsp;|\s)*<\/p>\s*)+$/gi, ``)
    .trim();

  return restoreRawBlocks(cleaned, blocks);
}

describe(`sanitize`, () => {
  it(`strips span tags from normal content`, () => {
    const input = `<p><span style="color:red">hello</span></p>`;
    expect(sanitize(input)).toBe(`<p>hello</p>`);
  });

  it(`strips trailing empty paragraphs`, () => {
    const input = `<p>hello</p><p><br>&nbsp;</p>`;
    expect(sanitize(input)).toBe(`<p>hello</p>`);
  });

  it(`preserves span tags inside raw-html-embed`, () => {
    const input = `<p>before</p><div class="raw-html-embed"><span style="color:red">keep me</span></div><p>after</p>`;
    expect(sanitize(input)).toBe(`<p>before</p><div class="raw-html-embed"><span style="color:red">keep me</span></div><p>after</p>`);
  });

  it(`handles nested divs inside raw-html-embed`, () => {
    const input = `<p>before</p><div class="raw-html-embed"><div class="inner"><span>keep</span></div></div><p>after</p>`;
    expect(sanitize(input)).toBe(`<p>before</p><div class="raw-html-embed"><div class="inner"><span>keep</span></div></div><p>after</p>`);
  });

  it(`handles multiple raw-html-embed blocks`, () => {
    const input = `<div class="raw-html-embed"><span>one</span></div><p><span>strip me</span></p><div class="raw-html-embed"><span>two</span></div>`;
    expect(sanitize(input)).toBe(`<div class="raw-html-embed"><span>one</span></div><p>strip me</p><div class="raw-html-embed"><span>two</span></div>`);
  });

  it(`handles deeply nested divs inside raw-html-embed`, () => {
    const input = `<div class="raw-html-embed"><div><div><span>deep</span></div></div></div>`;
    expect(sanitize(input)).toBe(`<div class="raw-html-embed"><div><div><span>deep</span></div></div></div>`);
  });

  it(`handles no raw-html-embed blocks`, () => {
    const input = `<p><span>strip</span></p>`;
    expect(sanitize(input)).toBe(`<p>strip</p>`);
  });

  it(`handles empty raw-html-embed`, () => {
    const input = `<div class="raw-html-embed"></div>`;
    expect(sanitize(input)).toBe(`<div class="raw-html-embed"></div>`);
  });
});
