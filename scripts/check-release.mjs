import { cli, run } from './lib/command.mjs';
import { project } from './project-config.mjs';
try {
  const sha = run('git', ['ls-remote', project.repository, 'refs/heads/main'])
    .trim()
    .split(/\s+/)[0];
  if (!/^[a-f0-9]{40}$/.test(sha))
    throw new Error('Unable to resolve remote main.');
  const host = new URL(project.origin).hostname;
  const data = JSON.parse(
    cli('vercel@65.0.0', 'vercel', [
      'api',
      '/v13/deployments/' + host + '?withGitRepoInfo=true',
      '--scope',
      project.teamSlug,
    ]),
  );
  const deployment = data.result?.deployment || data.deployment || data;
  const deployedSha =
    deployment.meta?.githubCommitSha || deployment.gitSource?.sha;
  const state = deployment.readyState || deployment.state;
  const response = await fetch(project.origin + '/login', {
    signal: AbortSignal.timeout(15000),
  });
  const html = await response.text();
  const iconResponse = await fetch(project.origin + '/icon.svg', {
    signal: AbortSignal.timeout(15000),
  });
  const icon = await iconResponse.text();
  const checks = {
    intendedProject:
      (deployment.projectId || deployment.project?.id) === project.projectId,
    intendedTeam:
      (deployment.team?.id || deployment.ownerId || deployment.teamId) ===
      project.teamId,
    gitSource: deployment.source === 'git',
    mainBranch:
      (deployment.meta?.githubCommitRef || deployment.gitSource?.ref) ===
      'main',
    commitMatchesMain: deployedSha === sha,
    productionReady: state === 'READY' && deployment.target === 'production',
    aliasAssigned: deployment.alias?.includes(host) === true,
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
        deployment: deployment.id,
        state,
        regions: deployment.regions,
        remoteMain: sha,
        deployedCommit: deployedSha,
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
