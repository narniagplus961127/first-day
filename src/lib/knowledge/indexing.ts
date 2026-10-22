import 'server-only';
import { APICallError, embedMany } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { AuthError } from '@/lib/auth';
import { providerFailure } from '@/lib/ai/provider-failure';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { inspectDocument } from './repository';

export const EMBEDDING_CONFIG =
  'google:gemini-embedding-2:768:document-prefix-v1:chunks-v1';

// Lines remain native to the uploaded source, including fenced code blocks.
export function chunkMarkdown(content: string) {
  const lines = content.split(/\r?\n/);
  const chunks: {
    ordinal: number;
    heading: string;
    start_line: number;
    end_line: number;
    content: string;
  }[] = [];
  let start = 0,
    heading = '',
    fence = false,
    size = 0;
  function flush(end: number) {
    const text = lines.slice(start, end).join('\n');
    if (text.trim())
      chunks.push({
        ordinal: chunks.length,
        heading,
        start_line: start + 1,
        end_line: end,
        content: text,
      });
    start = end;
    size = 0;
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!fence && /^#{1,6}\s+/.test(line)) {
      if (i > start) flush(i);
      heading = line.replace(/^#+\s+/, '');
    }
    if (!fence && size > 2200 && !line.trim()) flush(i);
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    size += line.length + 1;
  }
  flush(lines.length);
  return chunks;
}

export async function indexDocument(id: string, versionId?: string | null) {
  const result = await inspectDocument(id);
  if (!result) throw new AuthError(404, 'Guide not found.');
  const { document, version } = result;
  if (versionId && versionId !== version.id)
    throw new AuthError(
      409,
      'A newer candidate exists. Reload this guide before indexing.',
    );
  if (version.status === 'ready')
    return {
      status: 'ready',
      completed: version.chunk_count,
      total: version.chunk_count,
    };
  const chunks = chunkMarkdown(version.content);
  if (chunks.some((c) => c.content.length > 12000))
    throw new AuthError(
      400,
      'A source passage is too large to index. Split long paragraphs or code blocks and upload the guide again.',
    );
  const client = await createSupabaseServerClient();
  const { data: token, error: claimError } = await client.rpc(
    'claim_knowledge_index',
    { p_version: version.id, p_config: EMBEDDING_CONFIG },
  );
  if (claimError?.code === '40001')
    throw new AuthError(
      409,
      'A newer candidate exists. Reload this guide before indexing.',
    );
  if (claimError)
    throw new AuthError(503, 'Indexing storage is unavailable. Please retry.');
  if (!token)
    throw new AuthError(
      409,
      'This guide is being indexed. Wait a minute and retry.',
    );
  try {
    const prepared = await client.from('knowledge_chunks').upsert(
      chunks.map((c) => ({
        ...c,
        version_id: version.id,
        embedding_config: EMBEDDING_CONFIG,
      })),
      { onConflict: 'version_id,ordinal', ignoreDuplicates: true },
    );
    if (prepared.error) throw prepared.error;
    const counted = await client
      .from('knowledge_versions')
      .update({ chunk_count: chunks.length })
      .eq('id', version.id)
      .eq('index_token', token);
    if (counted.error) throw counted.error;
    const pending = await client
      .from('knowledge_chunks')
      .select('id,content')
      .eq('version_id', version.id)
      .is('embedding', null)
      .order('ordinal')
      .limit(4);
    if (pending.error) throw pending.error;
    if (pending.data.length) {
      let embeddings: number[][];
      try {
        const google = createGoogleGenerativeAI({
          apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
          baseURL: process.env.GOOGLE_EMBEDDING_BASE_URL,
        });
        ({ embeddings } = await embedMany({
          model: google.embedding('gemini-embedding-2'),
          dimensions: 768,
          values: pending.data.map(
            (c) => `title: ${document.title} | text: ${c.content}`,
          ),
          maxRetries: 0,
          abortSignal: AbortSignal.timeout(25000),
        }));
        if (
          embeddings.length !== pending.data.length ||
          embeddings.some(
            (e) => e.length !== 768 || e.some((n) => !Number.isFinite(n)),
          )
        )
          throw new Error('Invalid embedding response');
      } catch (error) {
        if (APICallError.isInstance(error) && error.statusCode === 400)
          throw new AuthError(
            503,
            'Google could not embed this content. Check passage size and model configuration before retrying.',
            { code: 'google_unavailable' },
          );
        throw providerFailure('Google', 'embedding', error);
      }
      for (let i = 0; i < embeddings.length; i++) {
        const saved = await client
          .from('knowledge_chunks')
          .update({ embedding: JSON.stringify(embeddings[i]) })
          .eq('id', pending.data[i].id);
        if (saved.error) throw saved.error;
      }
    }
    const published = await client.rpc('publish_knowledge_version', {
      p_version: version.id,
      p_token: token,
    });
    if (published.error?.code === '40001' || published.error?.code === 'P0002')
      throw new AuthError(
        409,
        'A newer candidate exists. Reload this guide before indexing.',
      );
    if (published.error) throw published.error;
    const { count, error } = await client
      .from('knowledge_chunks')
      .select('id', { count: 'exact', head: true })
      .eq('version_id', version.id)
      .not('embedding', 'is', null);
    if (error) throw error;
    if (!published.data) {
      const released = await client
        .from('knowledge_versions')
        .update({ index_token: null, index_lease_until: null })
        .eq('id', version.id)
        .eq('index_token', token);
      if (released.error) throw released.error;
    }
    return {
      status: published.data ? 'ready' : 'processing',
      completed: count,
      total: chunks.length,
    };
  } catch (error) {
    const failure =
      error instanceof AuthError
        ? error
        : new AuthError(
            503,
            'Indexing storage is temporarily unavailable. Retry to resume saved progress.',
            { code: 'storage_unavailable' },
          );
    await client
      .from('knowledge_versions')
      .update({
        status: 'failed',
        index_error: failure.message,
        index_token: null,
        index_lease_until: null,
      })
      .eq('id', version.id)
      .eq('index_token', token);
    throw failure;
  }
}
