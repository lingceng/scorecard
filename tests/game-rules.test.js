const assert = require('node:assert/strict')
const Rules = require('../shared/game-rules.js')

function award(rounds, roundMeta, idx, roundIndex) {
  return Rules.getPlayerAward({ idx, roundIndex, rounds, roundMeta, playerCount: 4 })
}

assert.deepEqual(Rules.getScores({ scores: [-1, -1, -1, 3] }), [-1, -1, -1, 3])
assert.deepEqual(Rules.normalizeMeta({ type: 'bomb', winner: 3, rate: 4 }, 4), { type: 'bomb', winner: 3, rate: 4 })
assert.equal(Rules.normalizeMeta({ type: 'bomb', winner: 9, rate: 4 }, 4), null)

assert.equal(award([[-1, -2, -3, 6]], [null], 3, 0).title, '这把有点东西')
assert.equal(award([[-1, -2, -3, 6]], [null], 3, 0).tier, 'medium')
assert.equal(award([[-4, -3, -3, 10]], [null], 3, 0).title, '在座各位，都是经验包')
assert.equal(award([[-5, -5, -4, 14]], [null], 3, 0).title, '牌桌接管')
assert.equal(award([[-6, -6, -6, 18]], [null], 3, 0).title, '一把打到大结局')
assert.equal(award([[-6, -6, -6, 18]], [null], 3, 0).tier, 'legendary')
assert.equal(award([[-4, -4, -4, 12]], [{ type: 'bomb', winner: 3, rate: 4 }], 3, 0).title, '好好好，就这么收是吧')
assert.equal(award([[-2, -2, -2, 6]], [{ type: 'bomb', winner: 3, rate: 2 }], 3, 0).title, '有炸必收')
assert.equal(award([[-2, -2, -2, 6]], [{ type: 'bomb', winner: 3, rate: 2 }], 3, 0).tier, 'bomb')

const fiveWins = Array.from({ length: 5 }, () => [-1, -1, -1, 3])
assert.equal(award(fiveWins, [null, null, null, null, null], 3, 4).title, '遥遥领先')

const comeback = [[3, -1, -1, -1], [3, -1, -1, -1], [3, -1, -1, -1], [3, -1, -1, -1], [-2, -2, -2, 6]]
assert.equal(award(comeback, [null, null, null, null, null], 3, 4).title, '从容翻盘')

console.log('game-rules: 15 assertions passed')
