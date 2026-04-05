export const generateCancelPaymentJobId = (paymentId: string) => {
  return `paymentCode-${paymentId}`;
};

export const generateProcessVideoJobId = (videoId: string) => {
  return `video-${videoId}`;
};
