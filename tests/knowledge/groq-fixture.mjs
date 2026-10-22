import { createServer } from 'node:http';
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
  const source =
    input.sources.find((s) => s.content.includes('npm run dev:firstday')) ||
    input.sources[0];
  const output = /salary/i.test(input.question)
    ? { supported: false, claims: [] }
    : {
        supported: true,
        claims: [
          {
            text: 'Run npm run dev:firstday. Copy .env.example to .env.local before starting.',
            sources: [
              {
                id: source.id,
                quote:
                  'Run npm run dev:firstday. Copy .env.example to .env.local before starting.',
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
