import {
  CreateJobCommand,
  MediaConvertClient,
} from '@aws-sdk/client-mediaconvert';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

const REGION = process.env.REGION;
const MEDIACONVERT_ENDPOINT = process.env.MEDIACONVERT_ENDPOINT;
const MEDIACONVERT_ROLE_ARN = process.env.MEDIACONVERT_ROLE_ARN;
const VIDEO_STATUS_QUEUE_URL = process.env.VIDEO_STATUS_QUEUE_URL;

const sqs = new SQSClient({ region: REGION });
const mediaConvert = new MediaConvertClient({
  region: REGION,
  endpoint: MEDIACONVERT_ENDPOINT,
});

export async function handler(event) {
  for (const record of event.Records) {
    const body = JSON.parse(record.body);
    const s3Event = body.Records?.[0];
    if (!s3Event) continue;

    const key = decodeURIComponent(s3Event.s3.object.key.replace(/\+/g, ' '));
    const bucket = s3Event.s3.bucket.name;

    console.log(`Processing: s3://${bucket}/${key}`);

    // Only process files matching: shops/{shopId}/videos/{videoId}.mp4
    if (!/^shops\/[^/]+\/videos\/[^/]+\.mp4$/.test(key)) {
      console.log(`Skipping non-video key: ${key}`);
      continue;
    }

    // Extract shopId and videoId
    const keyParts = key.split('/');
    const shopId = keyParts[1];
    const filename = keyParts[keyParts.length - 1];
    const videoId = filename.replace(/\.[^.]+$/, '');

    const inputS3 = `s3://${bucket}/${key}`;
    const outputS3 = `s3://${bucket}/shops/${shopId}/videos_hls/${videoId}/`;

    try {
      // Mark as PROCESSING
      await sendVideoStatus(videoId, { status: 'PROCESSING' });

      // Submit MediaConvert job
      const jobParams = buildMediaConvertJob({
        inputS3,
        outputS3,
        videoId,
      });

      const result = await mediaConvert.send(new CreateJobCommand(jobParams));
      console.log(`MediaConvert job created: ${result.Job?.Id} for ${videoId}`);
    } catch (err) {
      console.error(`Failed to submit job for ${videoId}:`, err);
      await sendVideoStatus(videoId, { status: 'FAILED' }).catch((e) =>
        console.error('Failed to send FAILED status:', e),
      );
      throw err;
    }
  }
}

function buildMediaConvertJob({ inputS3, outputS3, videoId }) {
  return {
    Role: MEDIACONVERT_ROLE_ARN,
    UserMetadata: { videoId },
    Settings: {
      Inputs: [
        {
          FileInput: inputS3,
          AudioSelectors: {
            'Audio Selector 1': { DefaultSelection: 'DEFAULT' },
          },
          VideoSelector: {},
          TimecodeSource: 'ZEROBASED',
        },
      ],
      OutputGroups: [
        // HLS ABR output (max 1080 + max 720, giữ ratio, không upscale)
        {
          Name: 'HLS',
          OutputGroupSettings: {
            Type: 'HLS_GROUP_SETTINGS',
            HlsGroupSettings: {
              Destination: outputS3,
              SegmentLength: 4,
              MinSegmentLength: 0,
              SegmentControl: 'SEGMENTED_FILES',
              ManifestDurationFormat: 'INTEGER',
            },
          },
          Outputs: [
            // Max 1080 (cạnh dài nhất ≤ 1080, giữ ratio, không upscale)
            {
              NameModifier: '_1080p',
              VideoDescription: {
                Height: 1080,
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    RateControlMode: 'QVBR',
                    MaxBitrate: 5000000,
                    QvbrSettings: { QvbrQualityLevel: 8 },
                    CodecProfile: 'HIGH',
                    CodecLevel: 'AUTO',
                    SceneChangeDetect: 'TRANSITION_DETECTION',
                    QualityTuningLevel: 'SINGLE_PASS_HQ',
                  },
                },
                ScalingBehavior: 'FIT_NO_UPSCALE',
                RespondToAfd: 'NONE',
              },
              AudioDescriptions: [
                {
                  CodecSettings: {
                    Codec: 'AAC',
                    AacSettings: {
                      Bitrate: 128000,
                      CodingMode: 'CODING_MODE_2_0',
                      SampleRate: 48000,
                    },
                  },
                  AudioSourceName: 'Audio Selector 1',
                },
              ],
              ContainerSettings: {
                Container: 'M3U8',
                M3u8Settings: {},
              },
            },
            // Max 720 (cạnh dài nhất ≤ 720, giữ ratio, không upscale)
            {
              NameModifier: '_720p',
              VideoDescription: {
                Height: 720,
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    RateControlMode: 'QVBR',
                    MaxBitrate: 2500000,
                    QvbrSettings: { QvbrQualityLevel: 7 },
                    CodecProfile: 'MAIN',
                    CodecLevel: 'AUTO',
                    SceneChangeDetect: 'TRANSITION_DETECTION',
                    QualityTuningLevel: 'SINGLE_PASS_HQ',
                  },
                },
                ScalingBehavior: 'FIT_NO_UPSCALE',
                RespondToAfd: 'NONE',
              },
              AudioDescriptions: [
                {
                  CodecSettings: {
                    Codec: 'AAC',
                    AacSettings: {
                      Bitrate: 96000,
                      CodingMode: 'CODING_MODE_2_0',
                      SampleRate: 48000,
                    },
                  },
                  AudioSourceName: 'Audio Selector 1',
                },
              ],
              ContainerSettings: {
                Container: 'M3U8',
                M3u8Settings: {},
              },
            },
          ],
        },
        // Thumbnail (Frame Capture — giữ ratio gốc, max 720 cạnh dài)
        {
          Name: 'Thumbnail',
          OutputGroupSettings: {
            Type: 'FILE_GROUP_SETTINGS',
            FileGroupSettings: {
              Destination: outputS3,
            },
          },
          Outputs: [
            {
              NameModifier: 'thumb',
              VideoDescription: {
                Height: 720,
                CodecSettings: {
                  Codec: 'FRAME_CAPTURE',
                  FrameCaptureSettings: {
                    FramerateNumerator: 1,
                    FramerateDenominator: 1,
                    MaxCaptures: 1,
                    Quality: 80,
                  },
                },
                ScalingBehavior: 'FIT_NO_UPSCALE',
              },
              ContainerSettings: {
                Container: 'RAW',
              },
            },
          ],
        },
      ],
      TimecodeConfig: {
        Source: 'ZEROBASED',
      },
    },
  };
}

async function sendVideoStatus(videoId, { status, duration, width, height }) {
  const message = {
    videoId,
    status,
    ...(duration !== undefined && { duration }),
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
  };

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: VIDEO_STATUS_QUEUE_URL,
      MessageBody: JSON.stringify(message),
    }),
  );

  console.log(`SQS sent: ${videoId} → ${status}`);
}
