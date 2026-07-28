import { copyFile, mkdir } from 'node:fs/promises'

await mkdir('dist/knowledge', { recursive: true })
await Promise.all([
  copyFile('_worker.js', 'dist/_worker.js'),
  copyFile('knowledge/topics.json', 'dist/knowledge/topics.json'),
])
