import { customAlphabet } from 'nanoid';

// Chỉ dùng chữ hoa và số, bỏ các ký tự dễ nhầm (I, 1, O, 0)
const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 6);

export const generateCode = (prefix: string) => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2); // 25
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 12
  const day = date.getDate().toString().padStart(2, '0'); // 22

  const randomSuffix = nanoid(); // VD: X9Y2Z1N8M4Q7

  return `${prefix}${year}${month}${day}${randomSuffix}`; // Kết quả: 251222X9Y2Z1N8M4Q7
};
