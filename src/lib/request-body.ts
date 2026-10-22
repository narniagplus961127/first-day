import { HttpError } from './http-error';

export async function readBoundedBody(
  body: ReadableStream<Uint8Array> | null,
  maximum: number,
  messages: { missing: string; tooLarge: string },
) {
  if (!body) throw new HttpError(400, messages.missing);
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maximum) {
      await reader.cancel();
      throw new HttpError(413, messages.tooLarge);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
