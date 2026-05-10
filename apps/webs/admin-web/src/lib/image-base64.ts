const BASE64_DATA_URL_REGEX = /^data:([^;]+);base64,(.+)$/;

export async function fileToBase64DataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Không thể đọc file ảnh dưới dạng base64.'));
        return;
      }
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(new Error('Đọc file ảnh thất bại.'));
    };

    reader.readAsDataURL(file);
  });
}

export function parseBase64DataUrl(base64DataUrl: string): {
  mimeType: string;
  data: string;
} {
  const match = base64DataUrl.match(BASE64_DATA_URL_REGEX);
  const mimeType = match?.[1];
  const data = match?.[2];

  if (!mimeType || !data) {
    throw new Error('Định dạng ảnh base64 không hợp lệ.');
  }

  return { mimeType, data };
}

export function base64DataUrlToBuffer(base64DataUrl: string): {
  mimeType: string;
  buffer: ArrayBuffer;
} {
  const { mimeType, data } = parseBase64DataUrl(base64DataUrl);
  const nodeBuffer = Buffer.from(data, 'base64');
  const buffer = nodeBuffer.buffer.slice(
    nodeBuffer.byteOffset,
    nodeBuffer.byteOffset + nodeBuffer.byteLength,
  ) as ArrayBuffer;
  return { mimeType, buffer };
}
