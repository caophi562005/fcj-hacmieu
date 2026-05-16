import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// Chạy mỗi giờ tại phút 0: xoá bot conversations expired > 24h
crons.hourly(
  'cleanup expired bot conversations',
  { minuteUTC: 0 },
  internal.bot.cleanup.cleanupExpired,
);

export default crons;
