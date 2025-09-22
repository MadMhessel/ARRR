import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

function runScript(filePath, context) {
  const code = readFileSync(join(projectRoot, filePath), 'utf8');
  const script = new vm.Script(code, { filename: filePath });
  script.runInContext(context);
}

const dom = new JSDOM(readFileSync(join(projectRoot, 'index.html'), 'utf8'), {
  pretendToBeVisual: true,
  url: 'http://localhost/',
  runScripts: 'outside-only'
});
const context = dom.getInternalVMContext();
context.console = console;
context.globalThis.console = console;

runScript('templates.js', context);
assert.ok(context.ITEM_TEMPLATES, 'ITEM_TEMPLATES should be exposed');
assert.ok(Object.keys(context.ITEM_TEMPLATES).length > 0, 'ITEM_TEMPLATES should not be empty');
assert.equal(typeof context.ITEM_TEMPLATES.zone?.svg, 'function', 'zone template should provide svg');

runScript('interact-stub.js', context);
assert.equal(typeof context.window.interact, 'function', 'interact stub should register global factory');

runScript('editor_wrapper.js', context);
assert.equal(typeof context.window.Editor, 'object', 'editor wrapper should expose Editor API');
assert.equal(typeof context.window.Editor.toggleTool, 'function', 'Editor.toggleTool should be callable');

console.info('[smoke] templates and editor wrappers load successfully');
