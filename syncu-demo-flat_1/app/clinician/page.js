"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { PATIENTS, PATIENT_LIST } from "../../lib/data";
import { interpret, SEVERITY } from "../../lib/engine";
import { Logo, SevDot, Spark } from "../ui";
import PatientDetail from "./PatientDetail";

export default function ClinicianWorkspace() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const panel = useMemo(
    () =>
      PATIENT_LIST.map((key) => {
        const p = PATIENTS[key];
        const r = interpret(p);
        const top = r.observations[0];
        return { key, p, r, top };
      }),
    []
  );

  if (selected) {
    const item = panel.find((x) => x.key === selected);
    return <PatientDetail item={item} onBack={() => setSelected(null)} panel={panel} onSelect={setSelected} />;
  }

  const priority = { action: 0, attention: 1, stable: 2, info: 3 };
  const sorted = [...panel].sort((a, b) => priority[a.top.severity] - priority[b.top.severity]);
  const filtered = filter === "all" ? sorted : sorted.filter((x) => {
    if (filter === "review") return ["action", "attention"].includes(x.top.severity);
    if (filter === "soon") return x.p.reviewIn === "1 day" || x.p.reviewIn === "3 days";
    return true;
  });

  const needsReview = panel.filter((x) => ["action", "attention"].includes(x.top.severity)).length;

  return (
    <main style={{ minHeight: "100vh", background: "var(--sand)" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid var(--line)", position: "sticky", top: 0, zIndex: 10 }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 62, maxWidth: 1180 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <Logo size={17} />
            <nav style={{ display: "flex", gap: 22, fontSize: 14 }} className="topnav">
              <span style={{ color: "var(--teal)", fontWeight: 600, borderBottom: "2px solid var(--teal)", paddingBottom: 20, marginBottom: -20 }}>Patients</span>
              <span className="muted">Schedule</span>
              <span className="muted">Messages</span>
              <span className="muted">Settings</span>
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link href="/" className="muted" style={{ fontSize: 13 }}>Exit demo</Link>
            <div style={{ width: 34, height: 34, borderRadius: 100, background: "var(--teal)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>DK</div>
          </div>
        </div>
      </header>

      <div className="wrap" style={{ maxWidth: 1180, paddingTop: 30, paddingBottom: 60 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Your panel · Maple Women’s Health</div>
            <h1 className="serif" style={{ fontSize: 30, fontWeight: 500 }}>Good morning, Dr Kaur</h1>
            <p className="muted" style={{ fontSize: 15, marginTop: 4 }}>
              {needsReview > 0
                ? <>You have <strong style={{ color: "var(--coral)" }}>{needsReview} patients</strong> Sync U has flagged for attention before their next visit.</>
                : "All patients are tracking as expected."}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["all", "All patients"], ["review", "Needs review"], ["soon", "Visit soon"]].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} className="pill"
                style={{ border: filter === k ? "none" : "1px solid var(--sand-2)", background: filter === k ? "var(--teal)" : "transparent", color: filter === k ? "#fff" : "var(--muted)", padding: "7px 14px" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
          {[
            ["Active patients", panel.length, "var(--teal)"],
            ["Flagged for review", needsReview, "var(--coral)"],
            ["Avg adherence", Math.round(panel.reduce((s, x) => s + x.r.adherence.overall, 0) / panel.length) + "%", "var(--good)"],
            ["Logging this week", "92%", "var(--teal)"],
          ].map(([l, v, c], i) => (
            <div key={i} className="card" style={{ padding: "16px 20px", flex: 1, minWidth: 150 }}>
              <div className="muted" style={{ fontSize: 12.5, marginBottom: 6 }}>{l}</div>
              <div className="serif" style={{ fontSize: 26, fontWeight: 500, color: c }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(({ key, p, r, top }) => {
            const sev = SEVERITY[top.severity];
            const primary = p.symptoms[0];
            const sparkData = p.entries.map((e) => (e.logged ? e[primary.key] : null));
            return (
              <button key={key} onClick={() => setSelected(key)} className="card patient-row"
                style={{ padding: 0, textAlign: "left", cursor: "pointer", overflow: "hidden", display: "block", transition: "box-shadow .15s, transform .15s" }}>
                <div style={{ display: "flex", alignItems: "stretch" }}>
                  <div style={{ width: 5, background: sev.color, flexShrink: 0 }} />
                  <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 20, width: "100%", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 200 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 100, background: p.conditionColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 15, flexShrink: 0 }}>
                        {p.initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15.5 }}>{p.name}</div>
                        <div className="muted" style={{ fontSize: 13 }}>{p.age} · {p.condition}</div>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                        <SevDot sev={top.severity} />
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: sev.color, textTransform: "uppercase", letterSpacing: ".05em" }}>{sev.label}</span>
                      </div>
                      <div style={{ fontSize: 14.5, color: "var(--ink)", lineHeight: 1.35 }}>{top.title}</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 130 }}>
                      <Spark data={sparkData} color={p.conditionColor} w={120} h={32} />
                      <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{primary.name} · 90d</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 76 }}>
                      <div className="serif" style={{ fontSize: 20, fontWeight: 500, color: r.adherence.overall >= 80 ? "var(--good)" : "var(--amber)" }}>
                        {r.adherence.overall}%
                      </div>
                      <div className="muted" style={{ fontSize: 11 }}>adherence</div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: 90 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{p.nextReview.split(",")[0]}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>next review</div>
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: 18 }}>→</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="muted" style={{ textAlign: "center", fontSize: 13, marginTop: 24 }}>
          Click any patient to open their between-visit summary. The flags, trends and adherence are computed from 90 days of logged data.
        </p>
      </div>

      <style>{`
        .patient-row:hover { box-shadow: var(--shadow-lg); transform: translateY(-1px); }
        @media (max-width: 720px){ .topnav { display:none !important; } }
      `}</style>
    </main>
  );
}
