import { cp, mkdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const mini = resolve(root, '../scorecard_mini')
const check = process.argv.includes('--check')
const files = [
  ['shared/game-rules.js', 'shared/game-rules.js'],
  ['shared/experience-spec.md', 'docs/双端体验基线.md'],
  ['assets/audio/bomb-4.mp3', 'assets/audio/bomb-4.mp3'],
  ['assets/audio/bomb-2.mp3', 'assets/audio/bomb-2.mp3'],
  ['assets/audio/bomb-ace.mp3', 'assets/audio/bomb-ace.mp3'],
  ['assets/audio/bomb-master.mp3', 'assets/audio/bomb-master.mp3'],
  ['assets/audio/score-6.mp3', 'assets/audio/score-6.mp3'],
  ['assets/audio/score-14.mp3', 'assets/audio/score-14.mp3'],
  ['assets/audio/score-18.mp3', 'assets/audio/score-18.mp3'],
  ['assets/audio/epic.mp3', 'assets/audio/epic.mp3'],
  ['assets/audio/comeback.mp3', 'assets/audio/comeback.mp3'],
  ['assets/audio/streak-10.mp3', 'assets/audio/streak-10.mp3'],
  ['assets/audio/streak-5.mp3', 'assets/audio/streak-5.mp3'],
  ['assets/audio/wins-10.mp3', 'assets/audio/wins-10.mp3'],
  ['assets/audio/wins-5.mp3', 'assets/audio/wins-5.mp3'],
  ['assets/audio/leader.mp3', 'assets/audio/leader.mp3'],
  ['assets/audio/settlement-flow.mp3', 'assets/audio/settlement-flow.mp3']
]

async function same(a, b) {
  try {
    var values = await Promise.all([readFile(a), readFile(b)])
    return values[0].equals(values[1])
  } catch (_) {
    return false
  }
}

var drift = []
for (const [source, target] of files) {
  const from = join(root, source)
  const to = join(mini, target)
  if (await same(from, to)) continue
  drift.push(target)
  if (!check) {
    await mkdir(dirname(to), { recursive: true })
    await cp(from, to)
  }
}

if (check && drift.length) {
  console.error('共享资料未同步：\n- ' + drift.join('\n- '))
  process.exitCode = 1
} else {
  console.log(drift.length ? '已同步 ' + drift.length + ' 个文件到 scorecard_mini' : '共享资料已同步')
}
