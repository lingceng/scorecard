import { access, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const rules = require(join(root, 'shared/game-rules.js'))
const source = await readFile(join(root, 'shared/game-rules.js'), 'utf8')
const awarded = new Set(rules.SCORE_TITLES.map((item) => item.title))

for (const match of source.matchAll(/makeAward\("([^"]+)"/g)) awarded.add(match[1])

const failures = []
for (const title of awarded) {
  const voiceKey = rules.TITLE_VOICES[title]
  if (!voiceKey) {
    failures.push(`称号缺少 voiceKey：${title}`)
    continue
  }
  const filename = rules.VOICE_FILES[voiceKey]
  if (!filename) {
    failures.push(`voiceKey 缺少文件映射：${title} -> ${voiceKey}`)
    continue
  }
  try {
    await access(join(root, 'assets/audio', filename))
  } catch {
    failures.push(`语音文件不存在：${title} -> assets/audio/${filename}`)
  }
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log(`称号语音完整：${awarded.size} 个称号均有本地资源`)
}
