import puppeteer from 'puppeteer';
import { createLogger } from '../../common/logger.js';

const log = createLogger(`services:pdf`);

const DEFAULT_OPTIONS = {
  format: `A4`,
  printBackground: true,
  margin: {
    top: `20mm`,
    right: `20mm`,
    bottom: `20mm`,
    left: `20mm`,
  },
};

/**
 * Generate a PDF buffer by navigating to a URL.
 *
 * @param {string} url     - the URL to render
 * @param {object} options - puppeteer PDF options override
 * @returns {Promise<Buffer>} PDF content
 */
export async function generatePdfFromUrl(url, options = {}) {
  let browser;

  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: `networkidle0` });

    const pdfOptions = { ...DEFAULT_OPTIONS, ...options };
    const buffer = await page.pdf(pdfOptions);

    log.info({ url }, `Generated PDF from URL`);
    return buffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate a PDF buffer from an HTML string.
 *
 * @param {string} html    - the HTML content to render
 * @param {object} options - puppeteer PDF options override
 * @returns {Promise<Buffer>} PDF content
 */
export async function generatePdfFromHtml(html, options = {}) {
  let browser;

  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: `networkidle0` });

    const pdfOptions = { ...DEFAULT_OPTIONS, ...options };
    const buffer = await page.pdf(pdfOptions);

    log.info(`Generated PDF from HTML`);
    return buffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
