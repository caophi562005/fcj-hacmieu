import z from 'zod';

export const TusdWebhookTypeValues = {
  'PRE-CREATE': 'pre-create',
  'POST-CREATE': 'post-create',
  'POST-FINISH': 'post-finish',
} as const;

export const TusdWebhookTypeEnums = z.enum([
  TusdWebhookTypeValues['PRE-CREATE'],
  TusdWebhookTypeValues['POST-CREATE'],
  TusdWebhookTypeValues['POST-FINISH'],
]);

export const VideoStatusValues = {
  UPLOADING: 'UPLOADING',
  UPLOADED: 'UPLOADED',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
  DELETED: 'DELETED',
} as const;

export const VideoStatusEnums = z.enum([
  VideoStatusValues.UPLOADING,
  VideoStatusValues.UPLOADED,
  VideoStatusValues.PROCESSING,
  VideoStatusValues.READY,
  VideoStatusValues.FAILED,
  VideoStatusValues.DELETED,
]);

export const VIDEO_QUEUE_NAME = 'video';

export const PROCESS_VIDEO_JOB_NAME = 'process-video';
