(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ScorecardRules = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var DEFAULT_PLAYERS = {
    3: ["A", "B", "C"],
    4: ["A", "B", "C", "D"],
    5: ["A", "B", "C", "D", "E"],
    6: ["A", "B", "C", "D", "E", "F"],
  };
  var SCORE_RANGE = { 3: 20, 4: 20, 5: 25, 6: 30 };
  var SYMBOLS = [
    "🦊",
    "🐼",
    "🐯",
    "🐸",
    "🐵",
    "🐙",
    "🦄",
    "🐧",
    "🐲",
    "🍉",
    "🍊",
    "🌶️",
    "🀄",
    "🃏",
    "♠️",
    "♥️",
    "🌙",
    "⭐",
  ];
  var TITLE_VOICES = {
    "好好好，就这么收是吧": "bomb4",
    爆破王牌: "bombAce",
    爆破宗师: "bombMaster",
    从容翻盘: "comeback",
    "在座各位，都是经验包": "epic",
    "十连胜，谁能管管": "streak10",
    遥遥领先: "streak5",
    十胜老炮: "wins10",
    五胜常客: "wins5",
    榜一大哥: "leader",
  };

  var SCORE_TITLES = [
    { min: 18, title: "一把打到大结局", tier: "legendary" },
    { min: 14, title: "牌桌接管", tier: "epic" },
    { min: 10, title: "在座各位，都是经验包", tier: "epic" },
    { min: 6, title: "这把有点东西", tier: "medium" },
  ];

  function makeArray(n, val) {
    var values = [];
    for (var i = 0; i < n; i++) values.push(val);
    return values;
  }

  function getScores(round) {
    return Array.isArray(round)
      ? round
      : round && Array.isArray(round.scores)
        ? round.scores
        : [];
  }

  function normalizeMeta(meta, playerCount) {
    return meta &&
      meta.type === "bomb" &&
      Number.isInteger(meta.winner) &&
      meta.winner >= 0 &&
      meta.winner < playerCount &&
      (meta.rate === 2 || meta.rate === 4)
      ? { type: "bomb", winner: meta.winner, rate: meta.rate }
      : null;
  }

  function signed(value) {
    return value > 0 ? "+" + value : String(value);
  }

  function getStreakAt(rounds, idx, end) {
    var sign = 0;
    var count = 0;
    for (var r = end; r >= 0; r--) {
      var value = getScores(rounds[r])[idx] || 0;
      var current = value > 0 ? 1 : value < 0 ? -1 : 0;
      if (!current) break;
      if (!sign) sign = current;
      if (current !== sign) break;
      count++;
    }
    return { sign: sign, count: count };
  }

  function getWinsAt(rounds, idx, end) {
    var count = 0;
    for (var r = 0; r <= end; r++)
      if ((getScores(rounds[r])[idx] || 0) > 0) count++;
    return count;
  }

  function getBombWinsAt(roundMeta, idx, end) {
    var count = 0;
    for (var r = 0; r <= end; r++) {
      var meta = roundMeta[r];
      if (meta && meta.type === "bomb" && meta.winner === idx) count++;
    }
    return count;
  }

  function getTotalsAt(rounds, playerCount, end) {
    var totals = makeArray(playerCount, 0);
    for (var r = 0; r <= end; r++) {
      var scores = getScores(rounds[r]);
      for (var i = 0; i < playerCount; i++) totals[i] += scores[i] || 0;
    }
    return totals;
  }

  function makeAward(title, tier) {
    return {
      title: title,
      tier: tier,
      voiceKey: TITLE_VOICES[title] || null,
      awarded: !!title,
    };
  }

  function getPlayerAward(options) {
    var idx = options.idx;
    var roundIndex = options.roundIndex;
    var rounds = options.rounds || [];
    var roundMeta = options.roundMeta || [];
    var playerCount =
      options.playerCount || (getScores(rounds[roundIndex]) || []).length;
    var scores = getScores(rounds[roundIndex]);
    var meta = normalizeMeta(roundMeta[roundIndex], playerCount);
    var score = scores[idx] || 0;
    var max = scores.length ? Math.max.apply(null, scores) : 0;
    var streak = getStreakAt(rounds, idx, roundIndex);
    var wins = getWinsAt(rounds, idx, roundIndex);
    var bombs = getBombWinsAt(roundMeta, idx, roundIndex);
    var atTotals = getTotalsAt(rounds, playerCount, roundIndex);
    var sorted = atTotals.slice().sort(function (a, b) {
      return b - a;
    });
    var rank = sorted.indexOf(atTotals[idx]) + 1;
    var lead = rank === 1 && sorted.length > 1 ? atTotals[idx] - sorted[1] : 0;
    var previousLead = 0;
    var losses = 0;

    if (roundIndex > 0) {
      var previousTotals = getTotalsAt(rounds, playerCount, roundIndex - 1);
      var previousSorted = previousTotals.slice().sort(function (a, b) {
        return b - a;
      });
      var previousRank = previousSorted.indexOf(previousTotals[idx]) + 1;
      previousLead =
        previousRank === 1 && previousSorted.length > 1
          ? previousTotals[idx] - previousSorted[1]
          : 0;
    }
    for (var r = roundIndex - 1; r >= 0; r--) {
      if ((getScores(rounds[r])[idx] || 0) < 0) losses++;
      else break;
    }

    if (meta && meta.winner === idx) {
      if (bombs === 5) return makeAward("爆破宗师", "bomb");
      if (bombs === 3) return makeAward("爆破王牌", "bomb");
      if (meta.rate === 4) return makeAward("好好好，就这么收是吧", "bomb");
      return makeAward("有炸必收", "bomb");
    }
    if (score > 0) {
      if (score >= 18) return makeAward("一把打到大结局", "legendary");
      if (losses >= 4 && max >= 4) return makeAward("从容翻盘", "epic");
      if (streak.count === 10) return makeAward("十连胜，谁能管管", "epic");
      if (streak.count === 5) return makeAward("遥遥领先", "epic");
      if (wins === 10) return makeAward("十胜老炮", "epic");
      if (wins === 5) return makeAward("五胜常客", "large");
      if (roundIndex >= 5 && lead >= 15 && previousLead < 15)
        return makeAward("榜一大哥", "large");
      for (var t = 0; t < SCORE_TITLES.length; t++) {
        if (score >= SCORE_TITLES[t].min)
          return makeAward(SCORE_TITLES[t].title, SCORE_TITLES[t].tier);
      }
      return makeAward("", "neutral");
    }
    return makeAward("", score < 0 ? "loss" : "neutral");
  }

  function isFirstAward(options) {
    var award = getPlayerAward(options);
    if (!award.awarded) return false;
    for (var r = 0; r < options.roundIndex; r++) {
      var previous = getPlayerAward({
        idx: options.idx,
        roundIndex: r,
        rounds: options.rounds,
        roundMeta: options.roundMeta,
        playerCount: options.playerCount,
      });
      if (previous.title === award.title) return false;
    }
    return true;
  }

  return {
    DEFAULT_PLAYERS: DEFAULT_PLAYERS,
    SCORE_RANGE: SCORE_RANGE,
    SYMBOLS: SYMBOLS,
    TITLE_VOICES: TITLE_VOICES,
    SCORE_TITLES: SCORE_TITLES,
    makeArray: makeArray,
    getScores: getScores,
    normalizeMeta: normalizeMeta,
    signed: signed,
    getStreakAt: getStreakAt,
    getWinsAt: getWinsAt,
    getBombWinsAt: getBombWinsAt,
    getTotalsAt: getTotalsAt,
    getPlayerAward: getPlayerAward,
    isFirstAward: isFirstAward,
  };
});
