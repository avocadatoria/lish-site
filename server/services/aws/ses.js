import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { createLogger } from '../../../common/logger.js';

const log = createLogger(`services:aws:ses`);

let _client = null;

function getClient() {
  if (!_client) {
    _client = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    log.info(`SESClient initialized`);
  }
  return _client;
}

/**
 * Send an email via AWS SES.
 *
 * @param {object}   params
 * @param {string[]} params.to      - array of recipient email addresses
 * @param {string[]} [params.cc]    - array of CC addresses (optional)
 * @param {string[]} [params.bcc]   - array of BCC addresses (optional)
 * @param {string}   params.subject - email subject line
 * @param {string}   params.html    - HTML body
 * @param {string}   [params.text]  - plain-text body (optional fallback)
 * @returns {Promise<{ messageId: string }>}
 */
export async function sendEmail({ to, cc, bcc, subject, html, text }) {
  const destination = { ToAddresses: to };
  if (cc?.length) destination.CcAddresses = cc;
  if (bcc?.length) destination.BccAddresses = bcc;

  const command = new SendEmailCommand({
    Source: process.env.AWS_SES_FROM_EMAIL,
    Destination: destination,
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: html },
        ...(text ? { Text: { Data: text } } : {}),
      },
    },
  });

  const result = await getClient().send(command);
  const messageId = result.MessageId;

  log.info({ messageId, to, cc, bcc, subject }, `Email sent via SES`);
  return { messageId };
}
