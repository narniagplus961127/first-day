import { cli, run } from './lib/command.mjs';
import { project } from './project-config.mjs';

try {
  const args = process.argv.slice(2);
  const explicitCommit = args[0] === '--commit' ? args[1] : undefined;
  if (
    args.length &&
    (args.length !== 2 || !/^[a-f0-9]{40}$/.test(explicitCommit || ''))
  ) {
    throw new Error(
      'Usage: npm run check:release [-- --commit <40-character SHA>]',
    );
  }
  const remoteMain = run('git', [
    'ls-remote',
    project.repository,
    'refs/heads/main',
  ])
    .trim()
    .split(/\s+/)[0];
  if (!/^[a-f0-9]{40}$/.test(remoteMain))
    throw new Error('Unable to resolve remote main.');
  const expectedCommit = explicitCommit || remoteMain;
  const host = new URL(project.origin).hostname;
  let data;
  try {
    data = JSON.parse(
      cli('vercel@65.0.0', 'vercel', [
        'api',
        '/v13/deployments/' + host + '?withGitRepoInfo=true',
        '--scope',
        project.teamSlug,
      ]),
    );
  } catch {
    throw new Error(
      'Unable to read deployment metadata. Check the existing Vercel CLI authentication and scoped project access; raw output was suppressed.',
    );
  }
  const d = data.result?.deployment || data.deployment || data;
  const deployedCommit =
    d.meta?.githubCommitSha || d.meta?.gitCommitSha || d.gitSource?.sha;
  const branch =
    d.meta?.githubCommitRef || d.meta?.gitCommitRef || d.gitSource?.ref;
  const state = d.readyState || d.state;
  const response = await fetch(project.origin + '/login', {
    signal: AbortSignal.timeout(15000),
  });
  const html = await response.text();
  const iconResponse = await fetch(project.origin + '/icon.svg', {
    signal: AbortSignal.timeout(15000),
  });
  const icon = await iconResponse.text();
  const checks = {
    intendedProject: (d.projectId || d.project?.id) === project.projectId,
    intendedTeam: (d.team?.id || d.ownerId || d.teamId) === project.teamId,
    expectedSource: explicitCommit
      ? ['git', 'cli'].includes(d.source)
      : d.source === 'git',
    expectedBranch: explicitCommit ? Boolean(branch) : branch === 'main',
    expectedCommit: deployedCommit === expectedCommit,
    productionReady: state === 'READY' && d.target === 'production',
    intendedRegion: d.regions?.length === 1 && d.regions[0] === project.region,
    aliasAssigned: d.alias?.includes(host) === true,
    login:
      response.status === 200 &&
      new URL(response.url).origin === project.origin &&
      html.includes('FirstDay') &&
      /rel="icon"/.test(html),
    favicon:
      iconResponse.status === 200 &&
      iconResponse.headers.get('content-type')?.includes('image/svg+xml') ===
        true &&
      icon.includes('FirstDay'),
  };
  const passed = Object.values(checks).every(Boolean);
  console.log(
    JSON.stringify(
      {
        origin: project.origin,
        deployment: d.id,
        state,
        regions: d.regions,
        mode: explicitCommit ? 'explicit-commit' : 'git-main',
        source: d.source,
        branch,
        remoteMain,
        expectedCommit,
        deployedCommit,
        matchesRemoteMain: deployedCommit === remoteMain,
        checks,
        passed,
      },
      null,
      2,
    ),
  );
  if (!passed) process.exitCode = 1;
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
