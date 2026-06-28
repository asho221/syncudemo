// ============================================================================
// Sync U — Clinical Interpretation Engine
// Rule-based analysis of between-visit data. Computes trajectories, adherence-
// response logic, side-effect patterns, wearable corroboration, data confidence,
// and produces ranked clinical observations. No black box — every observation
// carries the evidence it was derived from.
// ============================================================================

// ---- small stats helpers ----
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const round = (v, d = 1) => (v == null ? null : +v.toFixed(d));
function linregSlope(values) {
  // slope of best-fit line over index; values may contain nulls (skipped)
  const pts = values.map((v, i) => [i, v]).filter((p) => p[1] != null);
  if (pts.length < 4) return 0;
  const n = pts.length;
  const sx = pts.reduce((s, p) => s + p[0], 0);
  const sy = pts.reduce((s, p) => s + p[1], 0);
  const sxy = pts.reduce((s, p) => s + p[0] * p[1], 0);
  const sxx = pts.reduce((s, p) => s + p[0] * p[0], 0);
  return (n * sxy - sx * sy) / (n * sxx - sx * sx || 1);
}

// detect the biggest step-change point (where pre/post means differ most)
function inflection(values) {
  const v = values.map((x, i) => ({ i, x })).filter((p) => p.x != null);
  if (v.length < 14) return null;
  let best = null;
  for (let k = 7; k < v.length - 7; k++) {
    const a = mean(v.slice(0, k).map((p) => p.x));
    const b = mean(v.slice(k).map((p) => p.x));
    const d = Math.abs(a - b);
    if (!best || d > best.delta) best = { idx: v[k].i, delta: d, before: a, after: b };
  }
  return best;
}

// Pearson correlation between two aligned arrays (nulls dropped pairwise)
function corr(xs, ys) {
  const pairs = xs.map((x, i) => [x, ys[i]]).filter((p) => p[0] != null && p[1] != null);
  if (pairs.length < 8) return null;
  const mx = mean(pairs.map((p) => p[0]));
  const my = mean(pairs.map((p) => p[1]));
  let num = 0, dx = 0, dy = 0;
  for (const [x, y] of pairs) {
    num += (x - mx) * (y - my);
    dx += (x - mx) ** 2;
    dy += (y - my) ** 2;
  }
  const den = Math.sqrt(dx * dy);
  return den ? num / den : null;
}

// ---- per-symptom trajectory ----
export function trajectory(entries, symKey, invert) {
  const series = entries.map((e) => (e.logged ? e[symKey] : null));
  const logged = series.filter((v) => v != null);
  if (logged.length < 8) return null;

  const first14 = series.slice(0, 21).filter((v) => v != null);
  const last14 = series.slice(-21).filter((v) => v != null);
  const earlyAvg = mean(first14);
  const lateAvg = mean(last14);
  const slope = linregSlope(series);
  const infl = inflection(series);

  // direction: improving means moving the "good" way
  const rawDelta = lateAvg - earlyAvg;
  const improving = invert ? rawDelta < 0 : rawDelta > 0;
  const magnitude = Math.abs(rawDelta);
  const pctChange = earlyAvg ? Math.round((magnitude / earlyAvg) * 100) : 0;

  // variability (are they stable or swinging?)
  const sd = Math.sqrt(mean(logged.map((v) => (v - mean(logged)) ** 2)));

  let status; // improving | worsening | plateau | volatile
  if (sd > 2.4 && pctChange < 18) status = "volatile";
  else if (pctChange < 8) status = "plateau";
  else status = improving ? "improving" : "worsening";

  return {
    key: symKey,
    earlyAvg: round(earlyAvg),
    lateAvg: round(lateAvg),
    slope: round(slope, 3),
    pctChange,
    improving,
    status,
    sd: round(sd),
    inflection: infl ? { idx: infl.idx, before: round(infl.before), after: round(infl.after), delta: round(infl.delta) } : null,
    n: logged.length,
  };
}

// ---- adherence analysis ----
export function adherence(entries) {
  const logged = entries.filter((e) => e.logged && e.took != null);
  if (!logged.length) return null;
  const taken = logged.filter((e) => e.took).length;
  const overall = Math.round((taken / logged.length) * 100);

  // split in thirds to see direction
  const third = Math.floor(entries.length / 3);
  const seg = (arr) => {
    const l = arr.filter((e) => e.logged && e.took != null);
    return l.length ? Math.round((l.filter((e) => e.took).length / l.length) * 100) : null;
  };
  const t1 = seg(entries.slice(0, third));
  const t2 = seg(entries.slice(third, 2 * third));
  const t3 = seg(entries.slice(2 * third));

  // longest missed streak + where
  let streak = 0, maxStreak = 0, streakEndIdx = null, cur = 0;
  entries.forEach((e, i) => {
    if (e.logged && e.took === false) { cur++; if (cur > maxStreak) { maxStreak = cur; streakEndIdx = i; } }
    else cur = 0;
  });
  const missedDays = logged.filter((e) => !e.took).length;

  let trend; // improving | declining | steady
  if (t3 != null && t1 != null) {
    if (t3 - t1 >= 12) trend = "improving";
    else if (t1 - t3 >= 12) trend = "declining";
    else trend = "steady";
  } else trend = "steady";

  return { overall, t1, t2, t3, trend, missedDays, maxStreak, streakEndIdx };
}

// ---- the core clinical reasoning: is poor response explained by adherence? ----
export function responseVsAdherence(entries, primarySym, invert) {
  const traj = trajectory(entries, primarySym, invert);
  const adh = adherence(entries);
  if (!traj || !adh) return null;

  // correlation between daily adherence (taken=1) and next-window symptom
  const tookSeries = entries.map((e) => (e.logged && e.took != null ? (e.took ? 1 : 0) : null));
  const symSeries = entries.map((e) => (e.logged ? e[primarySym] : null));
  const c = corr(tookSeries, symSeries.map((v) => (v == null ? null : invert ? -v : v)));

  let verdict, confidence, detail;
  const weakResponse = traj.status === "plateau" || traj.status === "worsening" || traj.pctChange < 15;
  const poorAdh = adh.overall < 80;

  if (weakResponse && poorAdh) {
    verdict = "adherence-limited";
    confidence = adh.overall < 65 ? "high" : "moderate";
    detail = `Limited symptom change, but treatment taken on only ${adh.overall}% of days. The response may be limited by adherence rather than by the treatment itself.`;
  } else if (weakResponse && !poorAdh) {
    verdict = "true-non-response";
    confidence = "moderate";
    detail = `Adherence is good (${adh.overall}%), yet symptoms have not meaningfully changed. This looks like a genuine limited response — a treatment change may be warranted.`;
  } else if (!weakResponse && poorAdh) {
    verdict = "responding-despite-gaps";
    confidence = "moderate";
    detail = `Symptoms are improving despite adherence of ${adh.overall}%. Response is encouraging; consolidating adherence may improve it further.`;
  } else {
    verdict = "responding-well";
    confidence = "high";
    detail = `Symptoms improving with adherence at ${adh.overall}%. Current plan appears effective.`;
  }
  return { verdict, confidence, detail, correlation: round(c, 2), adherence: adh.overall, symStatus: traj.status };
}

// ---- side-effect pattern ----
export function sideEffects(entries) {
  const counts = {};
  let days = 0;
  entries.forEach((e) => {
    if (e.logged && e.sideEffects && e.sideEffects.length && !(e.sideEffects.length === 1 && e.sideEffects[0] === "None")) {
      days++;
      e.sideEffects.forEach((s) => { if (s !== "None") counts[s] = (counts[s] || 0) + 1; });
    }
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n }));
  // is it early (settling) or persistent?
  const withSE = entries.map((e, i) => ({ i, has: e.logged && e.sideEffects && e.sideEffects.some((s) => s !== "None") }));
  const lastSE = [...withSE].reverse().find((x) => x.has);
  const recent = lastSE ? lastSE.i > entries.length - 21 : false;
  return { days, top, recent };
}

// ---- data confidence (how much can we trust the picture?) ----
export function dataConfidence(entries) {
  const loggedDays = entries.filter((e) => e.logged).length;
  const rate = Math.round((loggedDays / entries.length) * 100);
  // recency: did they log in the last 7 days?
  const last7 = entries.slice(-7).filter((e) => e.logged).length;
  // longest gap
  let gap = 0, maxGap = 0;
  entries.forEach((e) => { if (!e.logged) { gap++; if (gap > maxGap) maxGap = gap; } else gap = 0; });

  let level;
  if (rate >= 80 && last7 >= 4) level = "high";
  else if (rate >= 60 && last7 >= 2) level = "moderate";
  else level = "limited";
  return { rate, last7, maxGap, level, loggedDays, total: entries.length };
}

// ---- wearable corroboration (where present) ----
export function wearableSignal(patient) {
  if (!patient.wearable) return null;
  // synthetic: derive a "sleep matches reported" agreement for menopause case
  const e = patient.entries.filter((x) => x.logged && x.sleep != null);
  if (!e.length) return null;
  const avgSleep = mean(e.map((x) => x.sleep));
  const recentSleep = mean(e.slice(-14).map((x) => x.sleep));
  return {
    device: patient.device,
    avgSleep: round(avgSleep),
    recentSleep: round(recentSleep),
    improving: recentSleep > avgSleep,
    note: "Wearable sleep data corroborates the patient-reported improvement in sleep quality.",
  };
}

// ============================================================================
// MASTER: produce ranked clinical observations for a patient
// ============================================================================
export function interpret(patient) {
  const entries = patient.entries;
  const primary = patient.symptoms[0];
  const adh = adherence(entries);
  const rva = responseVsAdherence(entries, primary.key, primary.invert);
  const se = sideEffects(entries);
  const conf = dataConfidence(entries);
  const wear = wearableSignal(patient);

  const trajectories = patient.symptoms.map((s) => trajectory(entries, s.key, s.invert)).filter(Boolean);

  // build ranked observations
  const obs = [];

  // 1. the headline reasoning (highest priority)
  if (rva) {
    const sev =
      rva.verdict === "true-non-response" ? "action" :
      rva.verdict === "adherence-limited" ? "attention" :
      "stable";
    obs.push({
      id: "response",
      severity: sev,
      title:
        rva.verdict === "adherence-limited" ? "Response may be limited by adherence, not the treatment" :
        rva.verdict === "true-non-response" ? "Limited response despite good adherence" :
        rva.verdict === "responding-despite-gaps" ? "Responding, with room to tighten adherence" :
        "Responding well to current plan",
      detail: rva.detail,
      evidence: `${primary.name} ${rva.symStatus} · adherence ${rva.adherence}%${rva.correlation != null ? ` · symptom–adherence correlation ${rva.correlation}` : ""}`,
      confidence: rva.confidence,
    });
  }

  // 2. per-symptom notable trajectories
  trajectories.forEach((t) => {
    const symName = patient.symptoms.find((s) => s.key === t.key).name;
    if (t.status === "improving" && t.pctChange >= 20) {
      obs.push({
        id: `traj-${t.key}`, severity: "stable",
        title: `${symName} improving${t.inflection ? " after a clear inflection" : ""}`,
        detail: `${symName} moved from ${t.earlyAvg} to ${t.lateAvg} (${t.pctChange}% better)${t.inflection ? `, with a step change around day ${t.inflection.idx}.` : "."}`,
        evidence: `${t.n} logged days · slope ${t.slope}`,
        confidence: t.n > 45 ? "high" : "moderate",
      });
    } else if (t.status === "worsening") {
      obs.push({
        id: `traj-${t.key}`, severity: "attention",
        title: `${symName} trending the wrong way`,
        detail: `${symName} moved from ${t.earlyAvg} to ${t.lateAvg} over the period.`,
        evidence: `${t.n} logged days · slope ${t.slope}`,
        confidence: "moderate",
      });
    } else if (t.status === "volatile") {
      obs.push({
        id: `traj-${t.key}`, severity: "attention",
        title: `${symName} is unstable day to day`,
        detail: `${symName} is swinging widely (variability ${t.sd}) rather than settling, which can point to inconsistent timing or triggers.`,
        evidence: `${t.n} logged days · SD ${t.sd}`,
        confidence: "moderate",
      });
    }
  });

  // 3. adherence-specific
  if (adh && adh.maxStreak >= 3 && adh.trend !== "improving") {
    obs.push({
      id: "adh-streak", severity: adh.overall < 70 ? "attention" : "stable",
      title: `Longest missed run: ${adh.maxStreak} consecutive days`,
      detail: `Adherence ${adh.trend === "declining" ? "has declined" : "has been uneven"} (${adh.t1}% → ${adh.t3}% across the period). Worth a conversation before changing the plan.`,
      evidence: `${adh.missedDays} missed days of ${conf.loggedDays} logged`,
      confidence: "high",
    });
  }

  // 4. side effects
  if (se.days > 0 && se.top.length) {
    obs.push({
      id: "se", severity: se.recent ? "attention" : "stable",
      title: se.recent ? `Ongoing side effect: ${se.top[0].name}` : `Side effects reported, now settled`,
      detail: `${se.top.map((s) => `${s.name} (${s.n}d)`).join(", ")}. ${se.recent ? "Still being reported in the last three weeks." : "Not reported recently — likely settled."}`,
      evidence: `${se.days} days with side effects`,
      confidence: "moderate",
    });
  }

  // 5. wearable corroboration
  if (wear) {
    obs.push({
      id: "wear", severity: "info",
      title: `${wear.device}: objective data agrees with what she reports`,
      detail: wear.note + ` Average sleep ${wear.avgSleep}h, recent ${wear.recentSleep}h.`,
      evidence: `Connected device · ${wear.improving ? "sleep trending up" : "sleep stable"}`,
      confidence: "high",
    });
  }

  // 6. data confidence (always last, framing)
  obs.push({
    id: "conf", severity: conf.level === "limited" ? "attention" : "info",
    title:
      conf.level === "high" ? "High-confidence picture" :
      conf.level === "moderate" ? "Reasonable picture, some gaps" :
      "Read with caution — sparse data",
    detail:
      conf.level === "limited"
        ? `Only ${conf.rate}% of days logged and ${conf.last7}/7 in the last week. Treat trends as indicative, not definitive.`
        : `${conf.loggedDays} of ${conf.total} days logged (${conf.rate}%), ${conf.last7}/7 in the last week. Longest gap ${conf.maxGap} days.`,
    evidence: `Logging ${conf.rate}% · recency ${conf.last7}/7`,
    confidence: "high",
  });

  // rank: action > attention > stable > info
  const order = { action: 0, attention: 1, stable: 2, info: 3 };
  obs.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    observations: obs,
    adherence: adh,
    responseVsAdherence: rva,
    sideEffects: se,
    confidence: conf,
    wearable: wear,
    trajectories,
    // a one-line headline for the top of the summary
    headline: obs[0] ? obs[0].title : "Stable",
  };
}

export const SEVERITY = {
  action:    { label: "Action suggested", color: "var(--coral)",  bg: "rgba(199,93,67,.10)" },
  attention: { label: "Worth attention",  color: "var(--amber)",  bg: "var(--amber-bg)" },
  stable:    { label: "Stable",           color: "var(--good)",   bg: "var(--good-bg)" },
  info:      { label: "Context",          color: "var(--teal)",   bg: "rgba(15,76,92,.07)" },
};
