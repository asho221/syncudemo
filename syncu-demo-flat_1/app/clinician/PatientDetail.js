"use client";
import { useState } from "react";
import Link from "next/link";
import { SEVERITY } from "../../lib/engine";
import { Logo, SevDot } from "../ui";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from "recharts";

function ConfBadge({ c }) {
  const map = { high: ["High confidence", "var(--good)"], moderate: ["Moderate", "var(--amber)"], low: ["Low", "var(--coral)"] };
  const [l, col] = map[c] || map.moderate;
  return <span style={{ fontSize: 11, fontWeight: 600, color: col }}>{l}</span>;
}

function ObsCard({ o }) {
  const sev = SEVERITY[o.severity];
  return (
    <div style={{ display: "flex", gap: 14, padding: "16px 18px", background: "#fff", border: "1px solid var(--line)", borderRadius: 12, borderLeft: `4px solid ${sev.color}` }}>
      <div style={{ paddingTop: 2 }}><SevDot sev={o.severity} /></div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 5 }}>
          <h4 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{o.title}</h4>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: sev.color, textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap" }}>{sev.label}</span>
        </div>
        <p style={{ fontSize: 13.5, color: "var(--ink)", lineHeight: 1.55, marginBottom: 8 }}>{o.detail}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, paddingTop: 8, borderTop: "1px dashed var(--line)" }}>
          <span className="muted" style={{ fontSize: 12 }}>Evidence: {o.evidence}</span>
          <ConfBadge c={o.confidence} />
        </div>
      </div>
    </div>
  );
}

function BigChart({ entries, sym, color, inflectionIdx }) {
  const data = entries.map((e, i) => ({ i, label: e.label, value: e.logged ? e[sym.key] : null }));
  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`bg-${sym.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 5" stroke="#EDE7DA" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9AA5A8" }} interval={Math.floor(data.length / 6)} tickLine={false} axisLine={{ stroke: "#E3DDD0" }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "#9AA5A8" }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E3DDD0" }} formatter={(v) => [v == null ? "no log" : `${v}${sym.unit}`, sym.name]} />
          {inflectionIdx != null && (
            <ReferenceLine x={data[inflectionIdx]?.label} stroke="var(--coral)" strokeDasharray="4 3" strokeWidth={1.5}
              label={{ value: "change", position: "top", fontSize: 10, fill: "var(--coral)" }} />
          )}
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.2} fill={`url(#bg-${sym.key})`} dot={false} connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function AdherenceGrid({ entries }) {
  const weeks = [];
  for (let i = 0; i < entries.length; i += 7) weeks.push(entries.slice(i, i + 7));
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {weeks.map((wk, wi) => (
          <div key={wi} style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span className="muted" style={{ fontSize: 10.5, width: 44, textAlign: "right", paddingRight: 4 }}>{wk[0]?.label}</span>
            {wk.map((e, di) => {
              let bg = "var(--line)", title = `${e.label}: no log`;
              if (e.logged && e.took === true) { bg = "var(--good)"; title = `${e.label}: taken`; }
              else if (e.logged && e.took === false) { bg = "var(--coral)"; title = `${e.label}: missed`; }
              return <div key={di} title={title} style={{ width: 26, height: 18, borderRadius: 3, background: bg }} />;
            })}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 12.5 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="dot" style={{ background: "var(--good)" }} /> Taken</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="dot" style={{ background: "var(--coral)" }} /> Missed</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="dot" style={{ background: "var(--line)" }} /> No log</span>
      </div>
    </div>
  );
}

export default function PatientDetail({ item, onBack, panel, onSelect }) {
  const { p, r } = item;
  const [tab, setTab] = useState("summary");
  const [prepping, setPrepping] = useState(false);
  const [prepped, setPrepped] = useState(false);

  const tabs = [
    ["summary", "Summary"],
    ["trends", "Symptom trends"],
    ["adherence", "Adherence"],
    ["timeline", "Patient notes"],
  ];

  function doPrep() {
    setPrepping(true);
    setTimeout(() => { setPrepping(false); setPrepped(true); }, 1400);
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--sand)" }}>
      {/* top bar */}
      <header style={{ background: "#fff", borderBottom: "1px solid var(--line)", position: "sticky", top: 0, zIndex: 10 }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 62, maxWidth: 1180 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <button onClick={onBack} className="muted" style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>← Panel</button>
            <div style={{ width: 1, height: 22, background: "var(--line)" }} />
            <Logo size={16} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* patient switcher */}
            {panel.map((x) => (
              <button key={x.key} onClick={() => onSelect(x.key)} title={x.p.name}
                style={{ width: 30, height: 30, borderRadius: 100, fontSize: 11, fontWeight: 600, border: x.key === item.key ? `2px solid ${x.p.conditionColor}` : "2px solid transparent", background: x.p.conditionColor, color: "#fff", opacity: x.key === item.key ? 1 : 0.45 }}>
                {x.p.initials}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="wrap" style={{ maxWidth: 1180, paddingTop: 26, paddingBottom: 60 }}>
        {/* patient header */}
        <div className="card" style={{ padding: "22px 26px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ width: 56, height: 56, borderRadius: 100, background: p.conditionColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 19 }}>{p.initials}</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 className="serif" style={{ fontSize: 26, fontWeight: 500 }}>{p.name}</h1>
            <div className="muted" style={{ fontSize: 14, marginTop: 2 }}>{p.age} · {p.condition} · {p.treatment}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="muted" style={{ fontSize: 12.5 }}>Next review</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: p.conditionColor }}>{p.nextReview}</div>
          </div>
          <button onClick={doPrep} className="btn btn-primary" style={{ height: 44 }} disabled={prepping || prepped}>
            {prepping ? "Preparing…" : prepped ? "✓ Visit brief ready" : "Prepare for visit"}
          </button>
        </div>

        {/* prepped banner */}
        {prepped && (
          <div className="fade" style={{ background: "var(--good-bg)", border: "1px solid #BFD9C8", borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16 }}>✓</span>
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>
              <strong>Visit brief generated.</strong> A one-page summary of the {r.confidence.loggedDays} logged days, the {r.observations.filter(o => o.severity === "action" || o.severity === "attention").length} items needing attention, and {p.name.split(" ")[0]}’s notes has been added to today’s appointment in your calendar and is ready to open at the start of the consult.
            </div>
          </div>
        )}

        {/* tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--line)", marginBottom: 22 }}>
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ padding: "11px 18px", fontSize: 14, fontWeight: 600, color: tab === k ? p.conditionColor : "var(--muted)", borderBottom: tab === k ? `2px solid ${p.conditionColor}` : "2px solid transparent", marginBottom: -1 }}>
              {l}
            </button>
          ))}
        </div>

        {/* ===== SUMMARY TAB ===== */}
        {tab === "summary" && (
          <div className="fade" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }} >
            <div>
              {/* the engine's headline reasoning */}
              <div style={{ marginBottom: 8 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Sync U analysis · {r.observations.length} observations</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {r.observations.map((o) => <ObsCard key={o.id} o={o} />)}
              </div>
            </div>

            {/* right rail: key metrics */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="card" style={{ padding: 20 }}>
                <div className="muted" style={{ fontSize: 12.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 16 }}>At a glance</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span className="muted" style={{ fontSize: 13 }}>Treatment adherence</span>
                      <span className="serif" style={{ fontSize: 24, fontWeight: 500, color: r.adherence.overall >= 80 ? "var(--good)" : "var(--amber)" }}>{r.adherence.overall}%</span>
                    </div>
                    <div style={{ height: 6, background: "var(--sand)", borderRadius: 10, marginTop: 6, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${r.adherence.overall}%`, background: r.adherence.overall >= 80 ? "var(--good)" : "var(--amber)", borderRadius: 10 }} />
                    </div>
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 5 }}>{r.adherence.t1}% → {r.adherence.t3}% · {r.adherence.trend}</div>
                  </div>
                  <div style={{ height: 1, background: "var(--line)" }} />
                  {r.trajectories.map((t) => {
                    const sname = p.symptoms.find((s) => s.key === t.key).name;
                    const col = t.status === "improving" ? "var(--good)" : t.status === "worsening" ? "var(--coral)" : "var(--amber)";
                    return (
                      <div key={t.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="muted" style={{ fontSize: 13 }}>{sname}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: col, textTransform: "capitalize" }}>
                          {t.status === "improving" ? "↓ " : t.status === "worsening" ? "↑ " : "→ "}{t.status} {t.pctChange ? `${t.pctChange}%` : ""}
                        </span>
                      </div>
                    );
                  })}
                  <div style={{ height: 1, background: "var(--line)" }} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="muted" style={{ fontSize: 13 }}>Days logged</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.confidence.loggedDays}/{r.confidence.total} ({r.confidence.rate}%)</span>
                  </div>
                  {p.wearable && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="muted" style={{ fontSize: 13 }}>Wearable</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: p.conditionColor }}>{p.device} ✓</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card" style={{ padding: 18, background: "var(--teal)", color: "#fff" }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, opacity: .8, marginBottom: 8 }}>What memory would have given you</div>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, color: "rgba(255,255,255,.85)" }}>
                  Without this, today’s decision rests on {p.name.split(" ")[0]} recalling the last few days in the room. Sync U replaces that with {r.confidence.loggedDays} days of evidence.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== TRENDS TAB ===== */}
        {tab === "trends" && (
          <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {p.symptoms.map((sym) => {
              const t = r.trajectories.find((x) => x.key === sym.key);
              return (
                <div key={sym.key} className="card" style={{ padding: 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 600 }}>{sym.name}</h3>
                      <span className="muted" style={{ fontSize: 12.5 }}>90 days · {sym.invert ? "lower is better" : "higher is better"} · {t?.n} logged</span>
                    </div>
                    {t && (
                      <span className={`pill ${t.status === "improving" ? "pill-good" : t.status === "worsening" ? "pill-coral" : "pill-amber"}`}>
                        {t.earlyAvg} → {t.lateAvg} ({t.pctChange}% {t.improving ? "better" : t.status === "plateau" ? "flat" : "change"})
                      </span>
                    )}
                  </div>
                  <BigChart entries={p.entries} sym={sym} color={p.conditionColor} inflectionIdx={sym.key === p.symptoms[0].key ? t?.inflection?.idx : null} />
                </div>
              );
            })}
          </div>
        )}

        {/* ===== ADHERENCE TAB ===== */}
        {tab === "adherence" && (
          <div className="fade" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
            <div className="card" style={{ padding: 22 }}>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Every day, 90 days</h3>
              <p className="muted" style={{ fontSize: 13, marginBottom: 18 }}>Did {p.name.split(" ")[0]} take the treatment?</p>
              <AdherenceGrid entries={p.entries} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="card" style={{ padding: 20 }}>
                <div className="serif" style={{ fontSize: 40, fontWeight: 500, color: r.adherence.overall >= 80 ? "var(--good)" : "var(--amber)", lineHeight: 1 }}>{r.adherence.overall}%</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>overall adherence · {r.adherence.missedDays} missed days</div>
                <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                  {[["First third", r.adherence.t1], ["Middle", r.adherence.t2], ["Recent", r.adherence.t3]].map(([l, v]) => (
                    <div key={l} style={{ flex: 1, textAlign: "center", padding: "10px 6px", background: "var(--ivory)", borderRadius: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>{v}%</div>
                      <div className="muted" style={{ fontSize: 10.5 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              {r.responseVsAdherence && (
                <div className="card" style={{ padding: 18, borderLeft: `4px solid ${SEVERITY[r.observations[0].severity].color}` }}>
                  <div className="muted" style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>The clinical question</div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.55 }}>{r.responseVsAdherence.detail}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== TIMELINE TAB ===== */}
        {tab === "timeline" && (
          <div className="fade card" style={{ padding: 26, maxWidth: 720 }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 20 }}>What {p.name.split(" ")[0]} flagged, in her words</h3>
            <div>
              {p.entries.filter((e) => e.note).map((e, i, arr) => (
                <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < arr.length - 1 ? 20 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ width: 11, height: 11, borderRadius: 100, background: p.conditionColor, marginTop: 3, flexShrink: 0 }} />
                    {i < arr.length - 1 && <span style={{ width: 2, flex: 1, background: "var(--line)", marginTop: 4 }} />}
                  </div>
                  <div style={{ paddingBottom: 4 }}>
                    <div className="muted" style={{ fontSize: 12.5, marginBottom: 3 }}>{e.label}</div>
                    <div style={{ fontSize: 14.5, color: "var(--ink)", lineHeight: 1.5 }}>{e.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* compliance footer */}
        <div style={{ marginTop: 28, paddingTop: 16, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <span className="muted" style={{ fontSize: 12, maxWidth: 620, lineHeight: 1.5 }}>
            Sync U displays patient-reported data and connected wearable signals and highlights patterns within it. It does not diagnose or recommend treatment. All clinical decisions remain with the clinician.
          </span>
          <span className="muted" style={{ fontSize: 12 }}>Synthetic demo data</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px){
          [class2="summary-grid"]{ grid-template-columns: 1fr !important; }
          .fade > div[style*="grid-template-columns"]{ grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
