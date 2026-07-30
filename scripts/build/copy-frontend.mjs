import { cp, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const sourceDir = fileURLToPath(new URL('../../frontend/dist/', import.meta.url))
const outputDir = fileURLToPath(new URL('../../dist/', import.meta.url))

await rm(outputDir, { recursive: true, force: true })
await cp(sourceDir, outputDir, { recursive: true })
