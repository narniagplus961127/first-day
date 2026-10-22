import { execFileSync } from 'node:child_process';
export function run(command, args, options = {}) {
  try {
    return execFileSync(command, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30000,
      maxBuffer: 8 * 1024 * 1024,
      ...options,
    });
  } catch {
    throw new Error(
      command === 'docker'
        ? 'Docker is unavailable or its requested local fixture operation failed.'
        : 'Command failed. Check local CLI installation, authentication and access; credential output was suppressed.',
    );
  }
}
export function cli(packageName, command, args, options = {}) {
  if (!process.env.npm_execpath)
    throw new Error('Run this command through its npm run script.');
  return run(
    process.execPath,
    [
      process.env.npm_execpath,
      'exec',
      '--yes',
      '--package=' + packageName,
      '--',
      command,
      ...args,
    ],
    options,
  );
}
