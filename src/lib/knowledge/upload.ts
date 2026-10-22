import { HttpError } from '@/lib/http-error';
import { readBoundedBody } from '@/lib/request-body';
import { MAX_FILE_BYTES } from './types';
import { hasEnglishProse } from './english';

export async function boundedFormData(request: Request) {
  const maximum = MAX_FILE_BYTES + 8192;
  if (Number(request.headers.get('content-length')) > maximum) {
    throw new HttpError(413, 'Upload one Markdown file no larger than 100 KB.');
  }
  if (
    !request.body ||
    !request.headers.get('content-type')?.startsWith('multipart/form-data;')
  ) {
    throw new HttpError(400, 'Choose one Markdown file.');
  }
  const body = await readBoundedBody(request.body, maximum, {
    missing: 'Choose one Markdown file.',
    tooLarge: 'Upload one Markdown file no larger than 100 KB.',
  });
  try {
    return await new Response(body, {
      headers: { 'content-type': request.headers.get('content-type')! },
    }).formData();
  } catch {
    throw new HttpError(
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
    throw new HttpError(
      400,
      'Choose one .md Markdown file. Other formats are not supported yet.',
    );
  }
  if (file.size > MAX_FILE_BYTES)
    throw new HttpError(413, 'Markdown files must be no larger than 100 KB.');
  let content: string;
  try {
    content = new TextDecoder('utf-8', { fatal: true }).decode(
      await file.arrayBuffer(),
    );
  } catch {
    throw new HttpError(
      400,
      'Save the Markdown file as UTF-8 text and try again.',
    );
  }
  if (
    !/[\p{L}\p{N}]/u.test(content) ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(content)
  ) {
    throw new HttpError(
      400,
      'The file is empty or is not usable Markdown text. Add your English onboarding instructions and try again.',
    );
  }

  if (!hasEnglishProse(content))
    throw new HttpError(
      400,
      'Use English for the guide instructions. Keep code and names as written, and add a short English explanation before trying again.',
    );
  return { filename: file.name, content };
}
