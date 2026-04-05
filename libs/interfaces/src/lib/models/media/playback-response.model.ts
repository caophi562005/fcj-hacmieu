import z from 'zod';

export const GetPlaybackResponseSchema = z.object({
  manifestUrl: z.string(),
  thumbnailUrl: z.string(),
  playbackToken: z.string(),
  expiresAt: z.number(),
});

export type GetPlaybackResponse = z.infer<typeof GetPlaybackResponseSchema>;
