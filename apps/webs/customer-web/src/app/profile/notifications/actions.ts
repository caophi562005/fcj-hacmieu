'use server';

import { revalidatePath } from 'next/cache';
import {
  deleteNotification,
  markNotificationsAsRead,
} from '../../../lib/notifications';

export type ActionState = { ok: boolean; message: string };

export async function markAsReadAction(id: string): Promise<ActionState> {
  try {
    await markNotificationsAsRead([id]);
    // Revalidate /profile/notifications để page render lại với isRead mới,
    // đồng thời revalidate / để Header cập nhật initial unread count.
    revalidatePath('/profile/notifications');
    revalidatePath('/', 'layout');
    return { ok: true, message: 'Đã đánh dấu đã đọc.' };
  } catch {
    return { ok: false, message: 'Không thể đánh dấu đã đọc.' };
  }
}

export async function deleteNotificationAction(
  id: string,
): Promise<ActionState> {
  try {
    await deleteNotification(id);
    revalidatePath('/profile/notifications');
    revalidatePath('/', 'layout');
    return { ok: true, message: 'Đã xoá thông báo.' };
  } catch {
    return { ok: false, message: 'Không thể xoá thông báo.' };
  }
}

export async function refreshNotificationsAction(): Promise<void> {
  // Chỉ revalidate page hiện tại. Header bell unread đã được SSE cập nhật real-time
  // → không cần revalidate root layout (tránh fetch chéo Header + Page hai lần).
  revalidatePath('/profile/notifications');
}
