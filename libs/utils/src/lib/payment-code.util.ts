import { customAlphabet } from 'nanoid';

const paymentCodeNanoId = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

export const generatePaymentCode = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `PAY${year}${month}${day}${paymentCodeNanoId()}`;
};
