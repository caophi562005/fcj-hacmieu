'use server';

import { revalidatePath } from 'next/cache';
import {
  createMarketingCampaign,
  dispatchMarketingCampaign,
  scanMarketing,
} from '../../../lib/admin-marketing';

function message(error: unknown) {
  return (
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ||
    (error instanceof Error ? error.message : 'Thao tác thất bại.')
  );
}

export async function createMarketingCampaignAction(input: {
  name: string;
  promotionId: string;
  subject: string;
  preheader?: string;
  introContent: string;
  scheduledAt?: string;
}) {
  try {
    await createMarketingCampaign(input);
    revalidatePath('/marketing');
    return { ok: true, message: 'Đã tạo chiến dịch.' };
  } catch (error) {
    return { ok: false, message: message(error) };
  }
}

export async function dispatchMarketingCampaignAction(id: string) {
  try {
    const result = await dispatchMarketingCampaign(id);
    revalidatePath('/marketing');
    return {
      ok: true,
      message: `Đã xếp hàng ${result.queuedCount} email.`,
    };
  } catch (error) {
    return { ok: false, message: message(error) };
  }
}

export async function scanMarketingAction() {
  try {
    const result = await scanMarketing();
    revalidatePath('/marketing');
    return {
      ok: true,
      message: `Đã xếp hàng ${result.queuedCount} email đến hạn.`,
    };
  } catch (error) {
    return { ok: false, message: message(error) };
  }
}
