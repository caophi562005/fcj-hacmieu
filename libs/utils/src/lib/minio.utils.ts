import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { createReadStream, createWriteStream, promises } from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

export const uploadDirectory = async (data: {
  bucket: string;
  prefix: string;
  dir: string;
  s3: any;
}) => {
  async function walk(p: string): Promise<string[]> {
    const entries = await promises.readdir(p, { withFileTypes: true });
    const files: string[] = [];
    for (const e of entries) {
      const full = path.join(p, e.name);
      if (e.isDirectory()) files.push(...(await walk(full)));
      else files.push(full);
    }
    return files;
  }

  const files = await walk(data.dir);
  for (const filePath of files) {
    const rel = path.relative(data.dir, filePath).replace(/\\/g, '/');
    const key = `${data.prefix}/${rel}`;
    await data.s3.send(
      new PutObjectCommand({
        Bucket: data.bucket,
        Key: key,
        Body: createReadStream(filePath),
        ContentType: guessContentType(key),
      })
    );
  }
};

const guessContentType = (key: string) => {
  if (key.endsWith('.m3u8')) return 'application/vnd.apple.mpegurl';
  if (key.endsWith('.mpd')) return 'application/dash+xml';
  if (key.endsWith('.m4s')) return 'video/iso.segment';
  if (key.endsWith('.mp4')) return 'video/mp4';
  if (key.endsWith('.jpg') || key.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
};

export const downloadToFile = async (data: {
  key: string;
  bucket: string;
  destPath: string;
  s3: any;
}) => {
  const res = await data.s3.send(
    new GetObjectCommand({ Bucket: data.bucket, Key: data.key })
  );
  // @ts-ignore
  await pipeline(res.Body, createWriteStream(data.destPath));
};

export const deleteFile = async (data: {
  key: string;
  bucket: string;
  s3: any;
}) => {
  await data.s3.send(
    new DeleteObjectCommand({
      Bucket: data.bucket,
      Key: data.key,
    })
  );
};
