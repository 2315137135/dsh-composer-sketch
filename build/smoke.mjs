import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(here, '..')
const chunkFile = 'client.whiteboard.js'

let registration
globalThis.window = {
  __ModuleLoader__: {
    load(value) {
      registration = value
    },
  },
}

const source = fs.readFileSync(path.join(packageRoot, chunkFile), 'utf8')
new Function('window', source)(globalThis.window)

if (registration === undefined) throw new Error('chunk did not register a module')
if (registration.id !== `@local/dsh-composer-sketch/${chunkFile}`) throw new Error(`unexpected module id: ${registration.id}`)
if (typeof registration.factory !== 'function') throw new Error('chunk registration carries no factory')

console.log(`${chunkFile}: registers ${registration.id} (${(Buffer.byteLength(source) / 1024 / 1024).toFixed(2)} MiB)`)
