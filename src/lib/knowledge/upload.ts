import { AuthError } from '@/lib/auth';
import { MAX_FILE_BYTES } from './types';

export async function boundedFormData(request: Request) {
  const maximum = MAX_FILE_BYTES + 8192;
  if (Number(request.headers.get('content-length')) > maximum) {
    throw new AuthError(413, 'Upload one Markdown file no larger than 100 KB.');
  }
  if (
    !request.body ||
    !request.headers.get('content-type')?.startsWith('multipart/form-data;')
  ) {
    throw new AuthError(400, 'Choose one Markdown file.');
  }
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maximum) {
      await reader.cancel();
      throw new AuthError(
        413,
        'Upload one Markdown file no larger than 100 KB.',
      );
    }
    chunks.push(value);
  }
  try {
    return await new Response(Buffer.concat(chunks), {
      headers: { 'content-type': request.headers.get('content-type')! },
    }).formData();
  } catch {
    throw new AuthError(
      400,
      'The upload could not be read. Choose the Markdown file again.',
    );
  }
}

export async function readMarkdownFile(form: FormData) {
  const files = [...form.values()].filter((value) => value instanceof File);
  const file = form.get('file');
  if (
    !(file instanceof File) ||
    files.length !== 1 ||
    !/\.md$/i.test(file.name) ||
    file.name.length > 255
  ) {
    throw new AuthError(
      400,
      'Choose one .md Markdown file. Other formats are not supported yet.',
    );
  }
  if (file.size > MAX_FILE_BYTES)
    throw new AuthError(413, 'Markdown files must be no larger than 100 KB.');
  let content: string;
  try {
    content = new TextDecoder('utf-8', { fatal: true }).decode(
      await file.arrayBuffer(),
    );
  } catch {
    throw new AuthError(
      400,
      'Save the Markdown file as UTF-8 text and try again.',
    );
  }
  if (
    !/[\p{L}\p{N}]/u.test(content) ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(content)
  ) {
    throw new AuthError(
      400,
      'The file is empty or is not usable Markdown text. Add your English onboarding instructions and try again.',
    );
  }

  return { filename: file.name, content };
}
