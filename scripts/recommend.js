/*
 * ToastFlow — Role Recommendation Engine
 * -------------------------------------------------------------
 * Pure, dependency-free. Runs in the browser (window.ToastFlow)
 * and in Node (module.exports). Given the member roster and the
 * historical appointment log, it recommends who should take each
 * open role for an upcoming meeting.
 *
 * Scoring philosophy (all transparent & explainable):
 *   1. Rotation fairness  — members who haven't had ANY role in a
 *                           long time float to the top.
 *   2. Role freshness     — prefer people who haven't done THIS role
 *                           recently, so skills spread around.
 *   3. Pathways level fit — match role difficulty to the member's
 *                           Pathways level / credentials.
 *   4. Load balancing     — penalise members already carrying many
 *                           recent appointments.
 * Every recommendation carries a human-readable `reasons` array so
 * the VPE can see WHY someone was suggested.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ToastFlow = Object.assign(root.ToastFlow || {}, api);
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Canonical booking roles used across the app.
  const ROLES = [
    'Prepared Speech 1', 'Prepared Speech 2', 'Prepared Speech 3', 'Prepared Speech 4',
    'Toastmaster of the Evening', 'Table Topics Master', 'General Evaluator',
    'Speech Evaluator 1', 'Speech Evaluator 2', 'Speech Evaluator 3', 'Speech Evaluator 4',
    'Timer', 'Ah-Counter', 'Language Evaluator', 'Sergeant at Arms'
  ];

  // Maps the historical sheet's role labels -> canonical booking roles.
  function canonicalRole(raw) {
    if (!raw) return null;
    const r = String(raw).trim().toLowerCase();
    if (/^speech\s*([1-5])/.test(r)) {
      const n = Math.min(4, +r.match(/^speech\s*([1-5])/)[1]);
      return 'Prepared Speech ' + n;
    }
    if (/^evaluator\s*([1-4])/.test(r)) return 'Speech Evaluator ' + r.match(/^evaluator\s*([1-4])/)[1];
    if (r === 'tme') return 'Toastmaster of the Evening';
    if (r === 'table topics') return 'Table Topics Master';
    if (r === 'timer') return 'Timer';
    if (r === 'ah counter' || r === 'ah-counter') return 'Ah-Counter';
    if (r === 'language evaluator') return 'Language Evaluator';
    if (r === 'general evaluator') return 'General Evaluator';
    return null; // SAA, Visiting TM, Special Speech, etc. — tracked as generic activity only.
  }

  // Role "families" for freshness scoring.
  function roleFamily(role) {
    if (/^Prepared Speech/.test(role)) return 'speech';
    if (/^Speech Evaluator/.test(role)) return 'evaluator';
    return role;
  }

  // Which roles suit which experience tier.
  // 'beginner' L1-2, 'intermediate' L2-4, 'advanced' L4-5 / legacy creds.
  const ROLE_TIER = {
    'Prepared Speech 1': 'any', 'Prepared Speech 2': 'any',
    'Prepared Speech 3': 'any', 'Prepared Speech 4': 'any',
    'Timer': 'beginner', 'Ah-Counter': 'beginner', 'Table Topics Master': 'intermediate',
    'Speech Evaluator 1': 'intermediate', 'Speech Evaluator 2': 'intermediate',
    'Speech Evaluator 3': 'intermediate', 'Speech Evaluator 4': 'intermediate',
    'Toastmaster of the Evening': 'intermediate',
    'General Evaluator': 'advanced', 'Language Evaluator': 'advanced'
  };

  // ---- name normalisation & matching ----
  function tokens(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/[.,].*$/g, ' ')           // drop credentials after comma/period-heavy tails
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1 && !['the', 'and', 'nus', 'sim', 'ntu'].includes(t));
  }
  // pull the leading person name out of a messy history cell
  function leadName(raw) {
    return String(raw || '')
      .split(/\s[-–]\s|,|\(|\bL\d|\bLevel\b|\bPM\b|\bPI\b|\bEH\b|\bVC\b/i)[0]
      .trim();
  }
  function matchMember(raw, members) {
    const rt = new Set(tokens(leadName(raw)));
    if (!rt.size) return null;
    let best = null, bestScore = 0;
    for (const m of members) {
      const mt = tokens(m.name);
      const shared = mt.filter(t => rt.has(t)).length;
      if (shared > bestScore) { bestScore = shared; best = m; }
    }
    return bestScore >= 2 ? best : (bestScore === 1 ? best : null);
  }

  // Estimate a member's experience tier from credentials / Pathways code.
  function memberTier(m) {
    const c = String(m.credentials || '').toUpperCase();
    if (/ATMB|ATMS|ATMG|ACB|ACS|ACG|DTM|CL|ALB/.test(c)) return 'advanced';
    const lvl = (c.match(/(?:PM|PI|EH|VC|MS|SR|DL|PU|LD)\s*([1-5])/) || [])[1];
    if (lvl) return +lvl >= 4 ? 'advanced' : (+lvl >= 2 ? 'intermediate' : 'beginner');
    if (/CC/.test(c)) return 'intermediate';
    return 'beginner';
  }
  const TIER_RANK = { beginner: 1, intermediate: 2, advanced: 3, any: 0 };

  // Planning priority order (lower = filled first). Set by the club's VPE rules.
  const ROLE_PRIORITY = {
    'Prepared Speech 1': 1, 'Prepared Speech 2': 1, 'Prepared Speech 3': 1, 'Prepared Speech 4': 1,
    'Speech Evaluator 1': 2, 'Speech Evaluator 2': 2, 'Speech Evaluator 3': 2, 'Speech Evaluator 4': 2,
    'Toastmaster of the Evening': 3, 'Table Topics Master': 4, 'Language Evaluator': 5,
    'General Evaluator': 6, 'Timer': 6, 'Ah-Counter': 6
  };

  function monthsBetween(a, b) {
    return Math.max(0, (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  }

  /**
   * Build a per-member activity profile from the history log.
   * history: [{date:'YYYY-MM-DD', role:'Speech 1', raw:'XU Jiaqi'}]
   */
  function buildProfiles(members, history, asOf) {
    const now = asOf ? new Date(asOf) : new Date();
    const prof = new Map();
    members.forEach(m => prof.set(m.name, {
      member: m, tier: memberTier(m),
      total: 0, lastAny: null,
      lastByFamily: {}, countByFamily: {}
    }));
    // only consider history strictly before the target meeting
    for (const h of history) {
      const d = new Date(h.date);
      if (isNaN(d) || d >= now) continue;
      const m = matchMember(h.raw, members);
      if (!m) continue;
      const p = prof.get(m.name);
      p.total++;
      if (!p.lastAny || d > p.lastAny) p.lastAny = d;
      const canon = canonicalRole(h.role);
      const fam = canon ? roleFamily(canon) : 'other';
      p.countByFamily[fam] = (p.countByFamily[fam] || 0) + 1;
      if (!p.lastByFamily[fam] || d > p.lastByFamily[fam]) p.lastByFamily[fam] = d;
    }
    return { prof, now };
  }

  /**
   * Recommend candidates for a single role.
   * opts: { role, members, history, asOf, exclude:Set<name>, limit }
   */
  function recommend(opts) {
    const { role, members, history } = opts;
    const exclude = opts.exclude instanceof Set ? opts.exclude : new Set(opts.exclude || []);
    const willing = new Set((opts.willingNames || []).map(n => String(n).toLowerCase()));
    const limit = opts.limit || 3;
    const { prof, now } = buildProfiles(members, history, opts.asOf);
    const fam = roleFamily(role);
    const wantTier = ROLE_TIER[role] || 'any';

    const scored = [];
    for (const [name, p] of prof) {
      if (exclude.has(name)) continue;
      const reasons = [];
      let score = 50;

      // 0) volunteered via Register Interest — strong signal, surfaced first
      const volunteered = willing.has(name.toLowerCase());
      if (volunteered) { score += 28; reasons.push('✋ Volunteered for this role'); }

      // 1) rotation fairness
      const monthsSinceAny = p.lastAny ? monthsBetween(p.lastAny, now) : 24;
      const fair = Math.min(30, monthsSinceAny * 4);
      score += fair;
      if (!p.lastAny) reasons.push('Has no recorded appointment yet');
      else if (monthsSinceAny >= 3) reasons.push(`Last active ${monthsSinceAny.toFixed(0)} mo ago`);

      // 2) role freshness
      const lastFam = p.lastByFamily[fam];
      const monthsSinceRole = lastFam ? monthsBetween(lastFam, now) : 24;
      score += Math.min(20, monthsSinceRole * 3);
      const famCount = p.countByFamily[fam] || 0;
      if (!lastFam) reasons.push(`New to ${prettyFamily(fam)} — skill-building opportunity`);
      else if (monthsSinceRole >= 4) reasons.push(`Hasn't done ${prettyFamily(fam)} in ${monthsSinceRole.toFixed(0)} mo`);
      // role affinity: members who have taken this role often likely prefer it
      if (famCount >= 2) { score += Math.min(12, famCount * 3); reasons.push(`Often takes ${prettyFamily(fam)} (${famCount}×) — likely prefers it`); }

      // 3) Pathways level fit
      if (wantTier !== 'any') {
        const diff = TIER_RANK[p.tier] - TIER_RANK[wantTier];
        if (diff === 0) { score += 12; reasons.push(`Level fits (${p.member.credentials || 'entry'})`); }
        else if (diff > 0) { score += 6; reasons.push(`Experienced enough (${p.member.credentials})`); }
        else { score -= 10 * Math.abs(diff); reasons.push(`Stretch role for current level`); }
      } else if (fam === 'speech' && p.member.credentials) {
        score += 4; reasons.push(`Pathways: ${p.member.credentials}`);
      }

      // 4) load balancing (dampen the over-used)
      score -= Math.min(18, p.total * 2);
      if (p.total >= 6) reasons.push(`Already carrying a heavy load (${p.total} roles)`);

      // experience bonus for high-responsibility roles so they aren't given to raw beginners
      if (wantTier === 'advanced' && famCount > 0) { score += 6; reasons.push('Has done this role before'); }

      scored.push({ name, member: p.member, tier: p.tier, score: Math.round(score), reasons });
    }

    scored.sort((a, b) => b.score - a.score || a.member.name.localeCompare(b.member.name));
    return scored.slice(0, limit);
  }

  function prettyFamily(fam) {
    return fam === 'speech' ? 'a prepared speech'
      : fam === 'evaluator' ? 'speech evaluation'
      : fam.toLowerCase();
  }

  /** Recommend for every open role of a meeting, avoiding double-booking. */
  function recommendMeeting(opts) {
    const { members, history, openRoles } = opts;
    const exclude = new Set(opts.taken || []); // names already booked
    const out = {};
    // Planning priority (VPE rule, descending): prepared speeches → speech evaluators
    // → TME → Table Topics → Language Evaluator → supporting roles.
    const order = (openRoles || ROLES).slice().sort(
      (a, b) => (ROLE_PRIORITY[a] || 9) - (ROLE_PRIORITY[b] || 9)
    );
    const willing = opts.willing || {}; // { role: [names] }
    for (const role of order) {
      const recs = recommend({ role, members, history, asOf: opts.asOf, exclude, willingNames: willing[role] || [], limit: opts.limit || 3 });
      out[role] = recs;
      if (recs[0]) exclude.add(recs[0].name); // tentatively reserve the top pick
    }
    return out;
  }

  return { ROLES, canonicalRole, roleFamily, memberTier, matchMember, recommend, recommendMeeting, buildProfiles };
});
