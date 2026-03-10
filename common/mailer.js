import { createLogger } from './logger.js';

const log = createLogger(`mailer`);

let sesService = null;
let models = null;

async function getSes() {
  if (!sesService) {
    const mod = await import(`../server/services/aws/ses.js`);
    sesService = mod;
  }
  return sesService;
}

async function getModels() {
  if (!models) {
    const mod = await import(`../db/models/index.js`);
    models = mod;
  }
  return models;
}

/**
 * Check if an email address is in the no-send list.
 * @param {string} email
 * @returns {Promise<import('sequelize').Model|null>}
 */
async function findNoSend(email) {
  const { NoSendEmailAddress } = await getModels();
  return NoSendEmailAddress.findOne({ where: { email: email.toLowerCase() } });
}

/**
 * Send an email through SES (or log it if ENABLE_MAIL is `false`).
 * Automatically prepends NONPROD_EMAIL_SUBJECT_PREFIX in non-production.
 *
 * Every call is logged to the SentEmail table. Recipients on the
 * NoSendEmailAddress list are blocked (logged with `sent: false`).
 *
 * @param {Object} opts
 * @param {string|string[]} opts.to  - Recipient email(s) (at least one required)
 * @param {string|string[]} [opts.cc]  - CC address(es)
 * @param {string|string[]} [opts.bcc] - BCC address(es)
 * @param {string} opts.subject - Email subject
 * @param {string} opts.html   - HTML body
 * @param {string} [opts.text] - Plain text body
 */
export async function sendMail({ to, cc, bcc, subject, html, text }) {
  const { SentEmail } = await getModels();

  const prefix = process.env.NONPROD_EMAIL_SUBJECT_PREFIX;
  const fullSubject = prefix ? `${prefix} ${subject}` : subject;

  const toList = Array.isArray(to) ? to : [to];
  const ccList = cc ? (Array.isArray(cc) ? cc : [cc]) : [];
  const bccList = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [];

  // --- Partition every address into blocked / allowed ---
  const allAddresses = [
    ...toList.map((addr) => ({ addr, field: `to` })),
    ...ccList.map((addr) => ({ addr, field: `cc` })),
    ...bccList.map((addr) => ({ addr, field: `bcc` })),
  ];

  const blocked = [];
  const allowedTo = [];
  const allowedCc = [];
  const allowedBcc = [];

  for (const { addr, field } of allAddresses) {
    const hit = await findNoSend(addr);
    if (hit) {
      blocked.push({ addr, field, reasonCode: hit.reasonCode });
    } else if (field === `to`) {
      allowedTo.push(addr);
    } else if (field === `cc`) {
      allowedCc.push(addr);
    } else {
      allowedBcc.push(addr);
    }
  }

  // --- Log blocked addresses ---
  for (const { addr, field, reasonCode } of blocked) {
    const reason = `Recipient in NoSendEmailAddress` + (reasonCode ? ` (${reasonCode})` : ``);
    log.info({ addr, field, reason }, `Blocked send to no-send address`);
    await SentEmail.create({
      to: addr,
      subject: fullSubject,
      html,
      text,
      messageId: null,
      sent: false,
      blockedReason: reason,
    });
  }

  // Nothing left to send
  if (!allowedTo.length && !allowedCc.length && !allowedBcc.length) {
    return { messageId: null, blocked: blocked.length };
  }

  // --- Send or log ---
  let messageId;

  if (process.env.ENABLE_MAIL !== `true`) {
    log.info({
      msg: `Mail sending disabled — logging instead`,
      to: allowedTo,
      cc: allowedCc.length ? allowedCc : undefined,
      bcc: allowedBcc.length ? allowedBcc : undefined,
      subject: fullSubject,
      bodyLength: html?.length || text?.length || 0,
    });
    messageId = `disabled`;
  } else {
    const ses = await getSes();
    const result = await ses.sendEmail({
      to: allowedTo,
      cc: allowedCc.length ? allowedCc : undefined,
      bcc: allowedBcc.length ? allowedBcc : undefined,
      subject: fullSubject,
      html,
      text,
    });
    messageId = result.messageId;
  }

  // --- Log each allowed recipient individually ---
  const ccStr = allowedCc.length ? allowedCc.join(`, `) : null;
  const bccStr = allowedBcc.length ? allowedBcc.join(`, `) : null;

  for (const addr of allowedTo) {
    await SentEmail.create({
      to: addr,
      cc: ccStr,
      bcc: bccStr,
      subject: fullSubject,
      html,
      text,
      messageId,
      sent: true,
    });
  }

  // Log cc/bcc recipients too (they received the email)
  for (const addr of allowedCc) {
    await SentEmail.create({
      to: addr,
      cc: ccStr,
      bcc: bccStr,
      subject: fullSubject,
      html,
      text,
      messageId,
      sent: true,
    });
  }

  for (const addr of allowedBcc) {
    await SentEmail.create({
      to: addr,
      cc: ccStr,
      bcc: bccStr,
      subject: fullSubject,
      html,
      text,
      messageId,
      sent: true,
    });
  }

  return { messageId, blocked: blocked.length };
}
