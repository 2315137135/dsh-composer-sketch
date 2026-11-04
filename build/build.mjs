import { build } from 'esbuild'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(here, '..')
const packageName = '@local/dsh-composer-sketch'
const chunkFile = 'client.whiteboard.js'
const outFile = path.join(packageRoot, chunkFile)

/** English ships inside the bundle; Chinese stays for the UI; the rest are ~1.4 MB of unused chunks. */
const stubNonEnglishLocales = {
  name: 'stub-non-english-locales',
  setup(build) {
    build.onResolve({ filter: /\/locales\/[^/]+\.js$/ }, (args) => {
      const file = path.posix.basename(args.path)
      if (file.startsWith('en-') || file.startsWith('zh-')) return null
      return { path: file, namespace: 'locale-stub' }
    })
    build.onLoad({ filter: /.*/, namespace: 'locale-stub' }, () => ({
      contents: 'export default {};',
      loader: 'js',
    }))
  },
}

/** The Mermaid-to-Excalidraw dialog pulls mermaid, cytoscape and katex (about 4 MB) into the chunk; that dialog is not offered. */
const stubMermaid = {
  name: 'stub-mermaid-bridge',
  setup(build) {
    build.onResolve({ filter: /^@excalidraw\/mermaid-to-excalidraw$/ }, () => ({ path: 'mermaid-stub', namespace: 'stub' }))
    build.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
      contents:
        'const unavailable = () => { throw new Error("Mermaid conversion is not bundled with this plugin."); };\n' +
        'module.exports = new Proxy({}, { get: () => unavailable });',
      loader: 'js',
    }))
  },
}

const UI_OFFSETS_START = 'C(this,"getEditorUIOffsets",()=>{'
const UI_OFFSETS_END = 'left:Math.max(n?.right??0,0)+i}});'

const patchedUiOffsets = `C(this,"getEditorUIOffsets",()=>{
  const container = this.excalidrawContainerRef?.current;
  const origin = container?.getBoundingClientRect();
  const ox = origin?.left ?? 0;
  const oy = origin?.top ?? 0;
  const rect = (selector) => {
    const element = container?.querySelector(selector);
    if (!element) return null;
    const box = element.getBoundingClientRect();
    return { left: box.left - ox, right: box.right - ox, top: box.top - oy, bottom: box.bottom - oy };
  };
  const toolbar = rect(".App-toolbar");
  const sidebar = rect(".sidebar");
  const menu = rect(".App-menu__left");
  const padding = 16;
  return qo().rtl
    ? {
        top: (toolbar?.bottom ?? 0) + padding,
        right: Math.max(this.state.width - (menu?.left ?? this.state.width), 0) + padding,
        bottom: padding,
        left: Math.max(sidebar?.right ?? 0, 0) + padding,
      }
    : {
        top: (toolbar?.bottom ?? 0) + padding,
        right: Math.max(this.state.width - (sidebar?.left ?? this.state.width) + padding, 0),
        bottom: padding,
        left: Math.max(menu?.right ?? 0, 0) + padding,
      };
});`

/**
 * Excalidraw reports UI offsets in client coordinates but consumes them as canvas-relative ones, so
 * any canvas that does not start at the window origin (our docked sidebar) shifts fit-to-content,
 * the flowchart shortcut and zoom-to-fit by the panel's own offset.
 */
const patchEditorUiOffsets = {
  name: 'patch-editor-ui-offsets',
  setup(build) {
    build.onLoad({ filter: /@excalidraw[\\/]excalidraw[\\/]dist[\\/]prod[\\/]index\.js$/ }, async (args) => {
      const source = await fs.readFile(args.path, 'utf8')
      const start = source.indexOf(UI_OFFSETS_START)
      const end = source.indexOf(UI_OFFSETS_END)
      if (start < 0 || end < start) throw new Error('getEditorUIOffsets is not where the patch expects it')
      const patched = source.slice(0, start) + patchedUiOffsets + source.slice(end + UI_OFFSETS_END.length)
      return { contents: patched, loader: 'js' }
    })
  },
}

const result = await build({
  entryPoints: [path.join(here, 'src', 'whiteboard.js')],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  write: false,
  legalComments: 'none',
  logLevel: 'warning',
  conditions: ['production', 'browser', 'import', 'default'],
  loader: { '.css': 'text', '.woff2': 'dataurl', '.woff': 'dataurl', '.ttf': 'dataurl' },
  external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  define: { 'process.env.NODE_ENV': '"production"', 'process.env.IS_PREACT': '"false"' },
  plugins: [stubNonEnglishLocales, stubMermaid, patchEditorUiOffsets],
  metafile: true,
})

const inputs = Object.entries(result.metafile.inputs)
  .map(([file, info]) => [file, info.bytes])
  .sort((a, b) => b[1] - a[1])
  .slice(0, 12)
if (process.env.SKETCH_BUILD_STATS === '1') {
  for (const [file, bytes] of inputs) console.log(`${(bytes / 1024).toFixed(0).padStart(7)} KiB  ${file}`)
  console.log('-- total outputs')
  for (const [file, info] of Object.entries(result.metafile.outputs)) console.log(`${(info.bytes / 1024).toFixed(0).padStart(7)} KiB  ${file}`)
}

const code = result.outputFiles[0].text
const wrapped = `window.__ModuleLoader__.load({
  id: '${packageName}/${chunkFile}',
  factory(require) {
    const module = { exports: {} };
    const exports = module.exports;
    (function (module, exports, require) {
${code}
    })(module, exports, require);
    return module.exports;
  },
});
`

await fs.writeFile(outFile, wrapped, 'utf8')
console.log(`${chunkFile}: ${(Buffer.byteLength(wrapped) / 1024 / 1024).toFixed(2)} MiB`)

