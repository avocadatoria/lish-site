import { createLogger } from './logger.js';

const log = createLogger(`mailer`);

let sesService = null;

async function getSes() {
  if (!sesService) {
    const mod = await import(`../server/services/aws/ses.js`);
    sesService = mod;
  }
  return sesService;
}

/**
 * Send an email through SES (or log it if ENABLE_MAIL is `false`).
 * Automatically prepends NONPROD_EMAIL_SUBJECT_PREFIX in non-production.
 *
 * @param {Object} opts
 * @param {string|string[]} opts.to  - Recipient email(s)
 * @param {string|string[]} [opts.cc]  - CC address(es)
 * @param {string|string[]} [opts.bcc] - BCC address(es)
 * @param {string} opts.subject - Email subject
 * @param {string} opts.html   - HTML body
 * @param {string} [opts.text] - Plain text body
 */
export async function sendMail({ to, cc, bcc, subject, html, text }) {
  const prefix = process.env.NONPROD_EMAIL_SUBJECT_PREFIX;
  const fullSubject = prefix ? `${prefix} ${subject}` : subject;

  const toList = Array.isArray(to) ? to : [to];
  const ccList = cc ? (Array.isArray(cc) ? cc : [cc]) : [];
  const bccList = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [];

  if (process.env.ENABLE_MAIL !== `true`) {
    log.info({
      msg: `Mail sending disabled — logging instead`,
      to: toList,
      cc: ccList.length ? ccList : undefined,
      bcc: bccList.length ? bccList : undefined,
      subject: fullSubject,
      bodyLength: html?.length || text?.length || 0,
    });
    return { messageId: `disabled` };
  }

  const ses = await getSes();
  const result = await ses.sendEmail({
    to: toList,
    cc: ccList.length ? ccList : undefined,
    bcc: bccList.length ? bccList : undefined,
    subject: fullSubject,
    html,
    text,
  });

  return { messageId: result.messageId };
}
