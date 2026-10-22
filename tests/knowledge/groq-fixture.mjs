import { createServer } from 'node:http';
const failures = new Set();
createServer(async (req, res) => {
  if (req.method === 'GET') {
    res.end('ready');
    return;
  }
  let raw = '';
  for await (const c of req) raw += c;
  const body = JSON.parse(raw);
  const input = JSON.parse(
    body.messages.findLast((m) => m.role === 'user').content,
  );
  if (input.question.includes('GROQ_QUOTA')) {
    res.writeHead(429, {
      'content-type': 'application/json',
      'retry-after': '31',
    });
    res.end(
      JSON.stringify({
        error: { message: 'Fixture Groq quota', type: 'rate_limit_error' },
      }),
    );
    return;
  }
  if (
    input.question.includes('GROQ_NETWORK') &&
    !failures.has(input.question)
  ) {
    failures.add(input.question);
    res.destroy();
    return;
  }
  const source =
    input.sources.find((s) => s.content.includes('Run npm run ')) ||
    input.sources[0];
  const instruction = source?.content.match(/Run npm run [^\n]+/)?.[0] || '';
  const output = /salary/i.test(input.question)
    ? { supported: false, claims: [] }
    : {
        supported: true,
        claims: [
          {
            text: instruction,
            sources: [
              {
                id: source.id,
                quote: instruction,
              },
            ],
          },
        ],
      };
  if (output.claims.length && /Invented source/.test(input.question))
    output.claims[0].sources[0].id = '00000000-0000-4000-8000-000000000000';
  if (output.claims.length && /Invented quote/.test(input.question))
    output.claims[0].sources[0].quote =
      'This fabricated passage does not occur in the source.';
  res.setHeader('content-type', 'application/json');
  res.end(
    JSON.stringify({
      id: 'fixture',
      object: 'chat.completion',
      created: 1,
      model: body.model,
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: JSON.stringify(output) },
          finish_reason: /Truncated/.test(input.question) ? 'length' : 'stop',
        },
      ],
      usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
    }),
  );
}).listen(19031, '127.0.0.1');
