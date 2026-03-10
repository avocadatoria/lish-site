import { MediaConvertClient, CreateJobCommand } from '@aws-sdk/client-mediaconvert';
import { createLogger } from '../../../common/logger.js';

const log = createLogger(`services:aws:media-convert`);

let _client = null;

function getClient() {
  if (!_client) {
    _client = new MediaConvertClient({
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_MEDIACONVERT_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    log.info(`MediaConvertClient initialized`);
  }
  return _client;
}

/**
 * Create a MediaConvert transcoding job.
 *
 * @param {object} params
 * @param {string} params.inputKey        - S3 key of the source media file
 * @param {string} params.outputKeyPrefix - S3 key prefix for transcoded output
 * @param {object} params.settings        - MediaConvert job settings (OutputGroups, etc.)
 * @returns {Promise<{ jobId: string }>}
 */
export async function createTranscodeJob({ inputKey, outputKeyPrefix, settings }) {
  const bucket = process.env.AWS_S3_BUCKET;

  const command = new CreateJobCommand({
    Role: process.env.AWS_MEDIACONVERT_ROLE,
    Settings: {
      Inputs: [
        {
          FileInput: `s3://${bucket}/${inputKey}`,
          ...settings.Inputs?.[0],
        },
      ],
      OutputGroups: settings.OutputGroups.map((group) => ({
        ...group,
        OutputGroupSettings: {
          ...group.OutputGroupSettings,
          FileGroupSettings: {
            Destination: `s3://${bucket}/${outputKeyPrefix}`,
            ...group.OutputGroupSettings?.FileGroupSettings,
          },
        },
      })),
      ...Object.fromEntries(
        Object.entries(settings).filter(
          ([key]) => key !== `Inputs` && key !== `OutputGroups`,
        ),
      ),
    },
  });

  const result = await getClient().send(command);
  const jobId = result.Job.Id;

  log.info({ jobId, inputKey, outputKeyPrefix }, `Created MediaConvert transcoding job`);
  return { jobId };
}
