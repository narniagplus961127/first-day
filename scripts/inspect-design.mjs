import { mkdtempSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from './lib/command.mjs';

const usage =
  'Usage: npm run inspect:design -- --list OR --frame "04 Overview" [--layer "Continue onboarding"]';
let temporary;
try {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (
      !['--list', '--frame', '--layer'].includes(key) ||
      options[key] !== undefined
    )
      throw new Error(usage);
    if (key === '--list') options[key] = true;
    else {
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new Error(usage);
      options[key] = value;
    }
  }
  if (options['--list'] ? args.length !== 1 : !options['--frame'])
    throw new Error(usage);
  const file = fileURLToPath(
    new URL('../design/FirstDay.figcraft', import.meta.url),
  );
  const binary =
    process.env.FIGCRAFT_CLI || 'C:/Program Files/FigCraft/figcraft-cli.exe';
  const roots = ['--automation-read-root', dirname(file)];
  const invoke = (args) => {
    try {
      return run(binary, args, { maxBuffer: 16 * 1024 * 1024 });
    } catch {
      throw new Error(
        'Read-only FigCraft inspection failed. Verify FigCraft is installed, or set FIGCRAFT_CLI to its CLI executable.',
      );
    }
  };
  const inventory = JSON.parse(invoke(['info', file, '--json', ...roots]));
  const frames = inventory.pages.flatMap((page) =>
    page.frames.map((frame) => ({ ...frame, page: page.name })),
  );
  if (options['--list'])
    console.log(
      JSON.stringify(
        { frames: frames.map(({ name, page }) => ({ name, page })) },
        null,
        2,
      ),
    );
  else {
    const selected = frames.filter(
      (frame) => frame.name.toLowerCase() === options['--frame'].toLowerCase(),
    );
    if (selected.length !== 1)
      throw new Error(
        'Choose one exact, unique frame name from --list; numeric frame IDs are not accepted.',
      );
    const frame = selected[0];
    temporary = mkdtempSync(join(tmpdir(), 'firstday-design-inspect-'));
    const command = join(temporary, 'read.json');
    writeFileSync(
      command,
      JSON.stringify([{ command: 'node.get', params: { id: frame.id } }]),
    );
    const response = JSON.parse(
      invoke([
        'run',
        command,
        '--in',
        file,
        ...roots,
        '--automation-read-root',
        temporary,
      ]).trim(),
    );
    if (!response.ok)
      throw new Error('FigCraft could not read the selected frame.');
    const layers = [];
    function visit(node) {
      for (const child of node.children || []) {
        layers.push(child);
        visit(child);
      }
    }
    visit(response.result);
    const query = options['--layer']?.toLowerCase();
    const matches = layers.filter(
      (layer) => !query || layer.name.toLowerCase().includes(query),
    );
    if (!matches.length)
      throw new Error(
        'No layer names match this filter in the selected frame.',
      );
    console.log(
      JSON.stringify(
        {
          frame: {
            name: frame.name,
            page: frame.page,
            width: frame.width,
            height: frame.height,
          },
          totalMatches: matches.length,
          layers: matches
            .slice(0, 40)
            .map((layer) => ({
              name: layer.name,
              type: layer.type,
              x: layer.x,
              y: layer.y,
              width: layer.width,
              height: layer.height,
              gap: layer.gap,
              padding: layer.padding,
              fontSize: layer.fontSize,
              colours: layer.fills?.map((fill) => fill.color).filter(Boolean),
              text: layer.characters?.slice(0, 120),
            })),
          truncated: matches.length > 40,
        },
        null,
        2,
      ),
    );
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (temporary) {
    unlinkSync(join(temporary, 'read.json'));
    rmdirSync(temporary);
  }
}
