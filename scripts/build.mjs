import { build } from 'esbuild';
import { mkdir, rm, cp, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const analyze = process.argv.includes('--analyze');
const entryFiles = [
  'templates.js',
  'interact-stub.js',
  'app.js',
  'editor_wrapper.js'
];
const staticAssets = ['index.html', 'style.css', 'placeholder_light_gray_block.png'];

async function ensureDist() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
}

async function buildEntry(entry, metaPath) {
  const result = await build({
    entryPoints: [join(rootDir, entry)],
    outfile: join(distDir, entry),
    bundle: false,
    minify: true,
    target: 'es2020',
    legalComments: 'none',
    drop: ['console', 'debugger'],
    metafile: Boolean(metaPath)
  });
  if (metaPath && result.metafile) {
    await writeFile(metaPath, JSON.stringify(result.metafile, null, 2));
  }
}

async function copyStatics() {
  for (const asset of staticAssets) {
    await cp(join(rootDir, asset), join(distDir, asset));
  }
  await cp(join(rootDir, 'src'), join(distDir, 'src'), { recursive: true });
}

async function runVisualizer(metaPath) {
  const binName = process.platform === 'win32' ? 'esbuild-visualizer.cmd' : 'esbuild-visualizer';
  const binPath = join(rootDir, 'node_modules', '.bin', binName);
  await execFileAsync(binPath, [
    '--metadata',
    metaPath,
    '--filename',
    join(distDir, 'bundle-report.html')
  ]);
}

async function main() {
  await ensureDist();
  await copyStatics();
  let metaPath = null;
  for (const entry of entryFiles) {
    const isApp = entry === 'app.js';
    const outMeta = analyze && isApp ? join(distDir, 'meta.json') : null;
    await buildEntry(entry, outMeta);
    metaPath = outMeta || metaPath;
  }
  if (analyze && metaPath) {
    await runVisualizer(metaPath);
  }
}

main().catch((error) => {
  console.error('[build] failed', error);
  process.exitCode = 1;
});
