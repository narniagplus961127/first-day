import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectFile } from '../../scripts/lib/repository-rules.mjs';
const path = '.scratch/example/issues/01-example.md';
test('rejects lifecycle used as a triage label and missing progress', () => {
  const errors = inspectFile(path, Buffer.from('**Status:** resolved\r\n'));
  assert.equal(errors.length, 2);
});
test('accepts separate permitted triage and lifecycle fields', () => {
  assert.deepEqual(
    inspectFile(
      path,
      Buffer.from('**Status:** ready-for-agent\r\n**Progress:** resolved\r\n'),
    ),
    [],
  );
});
test('rejects LF text while preserving native binary assets', () => {
  assert.equal(
    inspectFile('src/example.ts', Buffer.from('example\n')).length,
    1,
  );
  assert.deepEqual(
    inspectFile('design/approved.figcraft', Buffer.from('example\n')),
    [],
  );
  assert.deepEqual(
    inspectFile('public/font.bin', Buffer.from([0, 10, 42])),
    [],
  );
});
