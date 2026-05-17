import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

const REGION = process.env.REGION;
const BUCKET = process.env.BUCKET_NAME;
const VIDEO_STATUS_QUEUE_URL = process.env.VIDEO_STATUS_QUEUE_URL;

const s3 = new S3Client({ region: REGION });
const sqs = new SQSClient({ region: REGION });

/**
 * Triggered by EventBridge when MediaConvert job completes or errors.
 * Event detail: { status: "COMPLETE"|"ERROR", userMetadata: { videoId }, outputGroupDetails, ... }
 */
export async function handler(event) {
  const detail = event.detail;
  const videoId = detail.userMetadata?.videoId;

  if (!videoId) {
    console.log('No videoId in userMetadata, skipping');
    return;
  }

  console.log(`Job ${detail.jobId} for video ${videoId}: ${detail.status}`);

  if (detail.status === 'COMPLETE') {
    // Extract duration and resolution from job output
    const outputDetails = detail.outputGroupDetails?.[0]?.outputDetails?.[0];
    const duration = Math.round(
      Number(outputDetails?.durationInMs || 0) / 1000,
    );
    const width = outputDetails?.videoDetails?.widthInPx || 0;
    const height = outputDetails?.videoDetails?.heightInPx || 0;

    // Send READY status
    await sendVideoStatus(videoId, {
      status: 'READY',
      duration,
      width,
      height,
    });

    // Delete original video from S3
    // Reconstruct original key from input path in event
    const inputUri = detail.inputDetails?.[0]?.uri || '';
    const inputKey = inputUri.replace(`s3://${BUCKET}/`, '');
    if (inputKey) {
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: inputKey }));
      console.log(`Deleted original: ${inputKey}`);
    }

    console.log(`Done: ${videoId} (${duration}s, ${width}x${height})`);
  } else {
    // ERROR or CANCELED
    await sendVideoStatus(videoId, { status: 'FAILED' });
    console.error(
      `Job failed for ${videoId}:`,
      JSON.stringify(detail.errorMessage || detail),
    );
  }
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
