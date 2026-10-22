const labels = new Set([
  'needs-triage',
  'needs-info',
  'ready-for-agent',
  'ready-for-human',
  'wontfix',
]);
const progress = new Set(['not-started', 'in-progress', 'blocked', 'resolved']);
const binary = /\.(?:figcraft|png|jpe?g|gif|webp|ico|pdf|woff2?|ttf|zip)$/i;
export function inspectFile(path, bytes) {
  if (binary.test(path) || bytes.includes(0)) return [];
  const errors = [];
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return [path + ': expected UTF-8 text'];
  }
  if (/(?<!\r)\n|\r(?!\n)/.test(text))
    errors.push(path + ': expected CRLF line endings');
  if (/^\.scratch\/[^/]+\/issues\/[^/]+\.md$/.test(path)) {
    const field = (name) =>
      text
        .match(
          new RegExp(
            '^(?:\\*\\*)?' + name + ':(?:\\*\\*)?\\s*([^\\r\\n]+)',
            'm',
          ),
        )?.[1]
        ?.trim();
    if (!labels.has(field('Status')))
      errors.push(path + ': invalid or missing triage Status');
    if (!progress.has(field('Progress')))
      errors.push(path + ': invalid or missing lifecycle Progress');
  }
  return errors;
}
