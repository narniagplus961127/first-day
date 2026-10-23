import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const roles = ['frontend', 'backend', 'designer', 'business-analyst', 'hr'];
const normalized = (value) => value.replace(/\r\n/g, '\n');
export async function loadRoleSample(role) {
  if (!roles.includes(role))
    throw new Error(
      'Choose frontend, backend, designer, business-analyst or hr.',
    );
  const directory = new URL('../docs/samples/', import.meta.url);
  const manifest = JSON.parse(
    await readFile(new URL(role + '.json', directory), 'utf8'),
  );
  return {
    ...manifest,
    content: await readFile(new URL(manifest.filename, directory), 'utf8'),
  };
}
async function body(response) {
  const result = await response.json();
  if (!response.ok())
    throw new Error(
      result.error ||
        `Preparation stopped (${response.status()}). Retry explicitly after resolving the error.`,
    );
  return result;
}
function fields(task) {
  return {
    title: task.title,
    stage: task.stage,
    instructions: task.instructions,
    position: task.position,
    guideId: task.guideId || null,
    suggestedQuestion: task.suggestedQuestion || null,
  };
}
const equivalent = (left, right) =>
  JSON.stringify(left.map(fields)) === JSON.stringify(right.map(fields));

// Uses only public authenticated upload/index/checklist contracts. It never
// replaces a candidate, writes vectors, activates a version or clears activity.
export async function prepareRoleSample(manifest, api, { origin } = {}) {
  const headers = origin ? { origin } : {};
  const uploaded = await body(
    await api.post('/api/admin/documents', {
      headers,
      multipart: {
        title: manifest.title,
        jobRole: manifest.role,
        sampleKey: manifest.key,
        file: {
          name: manifest.filename,
          mimeType: 'text/markdown',
          buffer: Buffer.from(manifest.content),
        },
      },
    }),
  );
  const { document, version } = uploaded;
  if (
    document.title !== manifest.title ||
    document.job_role !== manifest.role ||
    version.filename !== manifest.filename ||
    normalized(version.content) !== normalized(manifest.content) ||
    (version.status === 'ready' &&
      (document.active_version_id !== version.id || !version.published_at))
  )
    return {
      status: 'diverged-guide',
      documentId: document.id,
      versionId: version.id,
      changed: false,
    };
  let changed = false;
  if (version.status !== 'ready' || document.active_version_id !== version.id) {
    // 100 KB sources require a finite number of four-passage batches. Stop on
    // every HTTP/provider error; do not spin past quota or concurrency feedback.
    for (let attempt = 0; attempt < 32; attempt++) {
      const result = await body(
        await api.post(
          `/api/admin/documents/${document.id}/index?version=${version.id}`,
          { headers },
        ),
      );
      changed = true;
      if (result.status === 'ready') break;
      if (attempt === 31)
        throw new Error(
          'Indexing remains incomplete. Rerun preparation to resume this candidate.',
        );
    }
  }
  const current = await body(
    await api.get('/api/checklists?role=' + encodeURIComponent(manifest.role)),
  );
  const tasks = manifest.tasks.map((task) => ({
    ...task,
    guideId: document.id,
  }));
  const result = {
    status: 'ready',
    documentId: document.id,
    versionId: version.id,
    revision: current.revision,
    taskIds: current.tasks.map((task) => task.id),
    changed,
  };
  if (equivalent(current.tasks, tasks)) return result;
  const originalFrontend =
    manifest.role === 'Frontend Developer' &&
    manifest.legacyTasks &&
    equivalent(current.tasks, manifest.legacyTasks);
  if (current.revision !== 0 && !originalFrontend)
    return { ...result, status: 'diverged-checklist' };
  const saved = await body(
    await api.put('/api/admin/checklists', {
      headers,
      data: {
        jobRole: manifest.role,
        expectedRevision: current.revision,
        tasks: tasks.map((task, index) =>
          originalFrontend ? { ...task, id: current.tasks[index].id } : task,
        ),
      },
    }),
  );
  return {
    ...result,
    revision: saved.revision,
    taskIds: saved.tasks.map((task) => task.id),
    changed: true,
  };
}

async function main() {
  const role = process.argv[2];
  const base = process.env.FIRSTDAY_BASE_URL || 'http://127.0.0.1:3000';
  const url = new URL(base);
  if (
    url.protocol !== 'https:' &&
    !['127.0.0.1', 'localhost'].includes(url.hostname)
  )
    throw new Error('Use HTTPS or a local loopback application.');
  const email = process.env.ADMIN_EMAIL,
    password = process.env.ADMIN_PASSWORD;
  if (!email || !password)
    throw new Error(
      'Provide ADMIN_EMAIL and ADMIN_PASSWORD in the local process environment. Never put credentials in arguments.',
    );
  let cookie = '';
  const request = async (path, options = {}) => {
    const headers = { origin: url.origin, ...(cookie ? { cookie } : {}) };
    let data;
    if (options.multipart) {
      data = new FormData();
      for (const [key, value] of Object.entries(options.multipart)) {
        if (typeof value === 'string') data.set(key, value);
        else
          data.set(
            key,
            new Blob([value.buffer], { type: value.mimeType }),
            value.name,
          );
      }
    } else if (options.data) {
      headers['content-type'] = 'application/json';
      data = JSON.stringify(options.data);
    }
    const response = await fetch(new URL(path, url), {
      method: options.method || 'GET',
      headers,
      body: data,
      redirect: 'error',
    });
    if (path === '/api/auth/login')
      cookie = response.headers
        .getSetCookie()
        .map((value) => value.split(';')[0])
        .join('; ');
    return {
      ok: () => response.ok,
      status: () => response.status,
      json: () => response.json(),
    };
  };
  await body(
    await request('/api/auth/login', {
      method: 'POST',
      data: { email, password },
    }),
  );
  const api = Object.fromEntries(
    ['get', 'post', 'put'].map((method) => [
      method,
      (path, options) =>
        request(path, { ...options, method: method.toUpperCase() }),
    ]),
  );
  console.log(
    JSON.stringify(
      await prepareRoleSample(await loadRoleSample(role), api, {
        origin: url.origin,
      }),
      null,
      2,
    ),
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
