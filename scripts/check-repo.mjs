import { readFileSync, existsSync } from 'node:fs';
import { run } from './lib/command.mjs';
import { inspectFile } from './lib/repository-rules.mjs';
const files = [
  ...new Set(
    run('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'])
      .split('\0')
      .filter(Boolean),
  ),
];
const errors = files
  .filter(existsSync)
  .flatMap((path) => inspectFile(path, readFileSync(path)));
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    'Repository rules passed: ' +
      files.length +
      ' files; CRLF and ticket fields checked, binary assets preserved.',
  );
