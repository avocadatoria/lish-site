import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { createLogger } from '../../../common/logger.js';

const log = createLogger(`services:aws:sns`);

let _client = null;

function getClient() {
  if (!_client) {
    _client = new SNSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    log.info(`SNSClient initialized`);
  }
  return _client;
}

/**
 * Publish a message to an SNS topic.
 *
 * @param {object} params
 * @param {string} params.topicArn - ARN of the SNS topic
 * @param {string} params.message  - message body
 * @param {string} [params.subject] - optional subject for email-based subscriptions
 * @returns {Promise<{ messageId: string }>}
 */
export async function publish({ topicArn, message, subject }) {
  const command = new PublishCommand({
    TopicArn: topicArn,
    Message: message,
    ...(subject ? { Subject: subject } : {}),
  });

  const result = await getClient().send(command);
  const messageId = result.MessageId;

  log.info({ messageId, topicArn, subject }, `Published message to SNS topic`);
  return { messageId };
}

/**
 * Send an SMS message via SNS.
 *
 * @param {object} params
 * @param {string} params.phoneNumber - E.164 formatted phone number
 * @param {string} params.message     - SMS body
 * @returns {Promise<{ messageId: string }>}
 */
export async function publishSms({ phoneNumber, message }) {
  const command = new PublishCommand({
    PhoneNumber: phoneNumber,
    Message: message,
  });

  const result = await getClient().send(command);
  const messageId = result.MessageId;

  log.info({ messageId, phoneNumber }, `Sent SMS via SNS`);
  return { messageId };
}
