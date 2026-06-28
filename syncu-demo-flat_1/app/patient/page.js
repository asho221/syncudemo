"use client";
import Link from "next/link";
import { useState } from "react";
import { PATIENTS } from "../../lib/data";
import { Logo, Spark } from "../ui";

const COND = [
  { key: "menopause", ...PATIENTS.menopause },
  { key: "pcos", ...PATIENTS.pcos },
  { key: "endo", ...PATIENTS.endo },
];

// ---------- input widgets ----------
function ScaleInput({ field, value, onChange, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--muted)", marginBottom: 8 }}>
        <span>{field.lowLabel}</span><span>{field.highLabel}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(11,1fr)", gap: 5 }}>
        {[0,1,2,3,4,5,6,7,8,9,10].map((n) => {
          const active = value === n;
          return (
            <button key={n} onClick={() => onChange(n)} style={{
              height: 40, borderRadius: 8, background: active ? color : "var(--ivory)",
              color: active ? "#fff" : "var(--muted)", border: `1.5px solid ${active ? color : "var(--line)"}`,
              fontWeight: 600, fontSize: 13.5, transition: "all .12s",
            }}>{n}</button>
          );
        })}
      </div>
    </div>
  );
}
function HoursInput({ value, onChange, color }) {
  return (
    <div style={{ display: "flex", gap: 7 }}>
      {[3,4,5,6,7,8,9].map((h) => {
        const active = value === h;
        return <button key={h} onClick={() => onChange(h)} style={{
          flex: 1, height: 52, borderRadius: 10, background: active ? color : "var(--ivory)",
          color: active ? "#fff" : "var(--ink)", border: `1.5px solid ${active ? color : "var(--line)"}`, fontWeight: 600, fontSize: 15,
        }}>{h}{h === 9 ? "+" : ""}h</button>;
      })}
    </div>
  );
}
function YesNo({ value, onChange, yesIsGood = true }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {[["Yes", true],["No", false]].map(([lbl, val]) => {
        const active = value === val; const good = val === yesIsGood;
        return <button key={lbl} onClick={() => onChange(val)} style={{
          flex: 1, height: 52, borderRadius: 10, fontWeight: 600, fontSize: 15.5,
          background: active ? (good ? "var(--good)" : "var(--coral)") : "var(--ivory)",
          color: active ? "#fff" : "var(--ink)", border: `1.5px solid ${active ? (good ? "var(--good)" : "var(--coral)") : "var(--line)"}`,
        }}>{lbl}</button>;
      })}
    </div>
  );
}
function Tags({ field, value, onChange, color }) {
  const v = value || [];
  function toggle(opt) {
    if (opt === "None") return onChange(["None"]);
    const without = v.filter((x) => x !== "None");
    onChange(without.includes(opt) ? without.filter((x) => x !== opt) : [...without, opt]);
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {field.options.map((opt) => {
        const active = v.includes(opt);
        return <button key={opt} onClick={() => toggle(opt)} style={{
          padding: "9px 14px", borderRadius: 100, fontSize: 14, fontWeight: 500,
          background: active ? color : "var(--ivory)", color: active ? "#fff" : "var(--muted)",
          border: `1.5px solid ${active ? color : "var(--line)"}`,
        }}>{opt}</button>;
      })}
    </div>
  );
}

// ---------- the phone shell ----------
function Phone({ children, color }) {
  return (
    <div style={{ width: 390, maxWidth: "100%" }}>
      <div style={{ background: "#fff", borderRadius: 30, overflow: "hidden", boxShadow: "var(--shadow-lg)", border: "1px solid var(--line)", height: 760, display: "flex", flexDirection: "column", position: "relative" }}>
        {children}
      </div>
    </div>
  );
}

export default function PatientApp() {
  const [condIdx, setCondIdx] = useState(0);
  const patient = COND[condIdx];
  const color = patient.conditionColor;
  const [screen, setScreen] = useState("home"); // home | log | done | history | device | onboard
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const fields = patient.logFields;
  const field = fields[step];
  const val = answers[field?.key];
  const canNext = field && (field.type === "tags" ? (val && val.length > 0) : val !== undefined && val !== null);

  // streak: count consecutive logged days from the end
  const streak = (() => { let s = 0; for (let i = patient.entries.length - 1; i >= 0; i--) { if (patient.entries[i].logged) s++; else break; } return s; })();
  const loggedDays = patient.entries.filter((e) => e.logged).length;
  const primary = patient.symptoms[0];

  function reset(idx) { setCondIdx(idx); setScreen("home"); setStep(0); setAnswers({}); }
  function nextQ() { if (step < fields.length - 1) setStep(step + 1); else setScreen("done"); }

  const fName = patient.name.split(" ")[0];

  return (
    <main style={{ minHeight: "100vh", background: "var(--sand)" }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link href="/" className="muted" style={{ fontSize: 14, fontWeight: 600 }}>← Demo home</Link>
        <div style={{ display: "flex", gap: 8 }}>
          {COND.map((c, i) => (
            <button key={c.key} onClick={() => reset(i)} className="pill"
              style={{ border: i === condIdx ? "none" : "1px solid var(--sand-2)", background: i === condIdx ? c.conditionColor : "transparent", color: i === condIdx ? "#fff" : "var(--muted)" }}>
              {c.condition}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "16px 16px 60px" }}>
        <div>
          <Phone color={color}>
            {/* ===== HOME ===== */}
            {screen === "home" && (
              <div className="fade" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ background: color, color: "#fff", padding: "22px 22px 26px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, opacity: .85 }}>
                    <span>Friday, 12 June</span><span>Sync U</span>
                  </div>
                  <div className="serif" style={{ fontSize: 24, fontWeight: 500, marginTop: 14 }}>Hello, {fName}</div>
                  <div style={{ fontSize: 14, opacity: .8, marginTop: 2 }}>{patient.condition} care · with Dr Kaur</div>
                </div>

                <div style={{ padding: "20px 20px 0", flex: 1, overflowY: "auto" }}>
                  {/* today's check card */}
                  <div style={{ background: "var(--ivory)", borderRadius: 16, padding: 18, marginBottom: 16, border: `1px solid var(--line)` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>Today’s check</div>
                        <div className="muted" style={{ fontSize: 13 }}>Not done yet · about 90 seconds</div>
                      </div>
                      <div style={{ width: 40, height: 40, borderRadius: 100, background: "#fff", border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", color, fontWeight: 700, fontSize: 13 }}>{fields.length}</div>
                    </div>
                    <button onClick={() => { setScreen("log"); setStep(0); setAnswers({}); }} className="btn" style={{ width: "100%", background: color, color: "#fff", height: 46 }}>Start today’s check</button>
                  </div>

                  {/* streak + stats */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                    <div style={{ flex: 1, background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 14, textAlign: "center" }}>
                      <div className="serif" style={{ fontSize: 26, fontWeight: 600, color }}>{streak}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>day streak 🔥</div>
                    </div>
                    <div style={{ flex: 1, background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 14, textAlign: "center" }}>
                      <div className="serif" style={{ fontSize: 26, fontWeight: 600, color }}>{loggedDays}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>total check-ins</div>
                    </div>
                  </div>

                  {/* mini trend */}
                  <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>Your {primary.name.toLowerCase()}</span>
                      <button onClick={() => setScreen("history")} style={{ fontSize: 12.5, color, fontWeight: 600 }}>See history →</button>
                    </div>
                    <Spark data={patient.entries.map((e) => (e.logged ? e[primary.key] : null))} color={color} w={320} h={46} />
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>Last 90 days · your clinician sees this</div>
                  </div>

                  {/* device row */}
                  <button onClick={() => setScreen("device")} style={{ width: "100%", background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: patient.wearable ? "var(--good-bg)" : "var(--sand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{patient.wearable ? "⌚" : "+"}</div>
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{patient.wearable ? patient.device : "Connect a device"}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{patient.wearable ? "Syncing sleep & activity" : "Optional — adds sleep & activity"}</div>
                    </div>
                    <span className="muted">→</span>
                  </button>
                </div>

                {/* bottom nav */}
                <div style={{ display: "flex", borderTop: "1px solid var(--line)", padding: "10px 0" }}>
                  {[["Home","🏠","home"],["History","📊","history"],["Device","⌚","device"]].map(([l, ic, sc]) => (
                    <button key={l} onClick={() => setScreen(sc)} style={{ flex: 1, textAlign: "center", fontSize: 11, color: screen === sc ? color : "var(--muted)", fontWeight: 600 }}>
                      <div style={{ fontSize: 17, marginBottom: 2 }}>{ic}</div>{l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ===== LOG FLOW ===== */}
            {screen === "log" && (
              <div className="fade" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ background: color, color: "#fff", padding: "20px 22px" }}>
                  <button onClick={() => setScreen("home")} style={{ color: "#fff", fontSize: 13, opacity: .85, marginBottom: 10 }}>← Cancel</button>
                  <div className="serif" style={{ fontSize: 20, fontWeight: 500 }}>Today’s check</div>
                  <div style={{ height: 5, background: "rgba(255,255,255,.2)", borderRadius: 10, marginTop: 14, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(step / fields.length) * 100}%`, background: "rgba(255,255,255,.9)", borderRadius: 10, transition: "width .3s" }} />
                  </div>
                  <div style={{ fontSize: 11.5, opacity: .8, marginTop: 7 }}>Question {step + 1} of {fields.length}</div>
                </div>
                <div style={{ padding: "26px 22px", flex: 1, display: "flex", flexDirection: "column" }} key={step}>
                  <div className="fade" style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".06em", color, textTransform: "uppercase", marginBottom: 12 }}>{patient.condition}</div>
                    <h2 style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.3, marginBottom: 22 }}>{field.label}</h2>
                    {field.type === "scale" && <ScaleInput field={field} value={val} onChange={(v) => setAnswers((a) => ({ ...a, [field.key]: v }))} color={color} />}
                    {field.type === "hours" && <HoursInput value={val} onChange={(v) => setAnswers((a) => ({ ...a, [field.key]: v }))} color={color} />}
                    {field.type === "yesno" && <YesNo value={val} onChange={(v) => setAnswers((a) => ({ ...a, [field.key]: v }))} yesIsGood={field.key === "took"} />}
                    {field.type === "tags" && <Tags field={field} value={val} onChange={(v) => setAnswers((a) => ({ ...a, [field.key]: v }))} color={color} />}
                  </div>
                  <button className="btn" onClick={nextQ} disabled={!canNext} style={{ width: "100%", marginTop: 24, height: 52, background: color, color: "#fff", opacity: canNext ? 1 : .4 }}>
                    {step < fields.length - 1 ? "Continue" : "Finish"}
                  </button>
                </div>
              </div>
            )}

            {/* ===== DONE ===== */}
            {screen === "done" && (
              <div className="fade" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "30px 22px" }}>
                <div style={{ width: 64, height: 64, borderRadius: 100, background: "var(--good-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "20px auto 18px" }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="var(--good)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <h2 className="serif" style={{ fontSize: 23, fontWeight: 500, textAlign: "center", marginBottom: 8 }}>Logged. Streak now {streak + 1} 🔥</h2>
                <p className="muted" style={{ fontSize: 14.5, textAlign: "center", lineHeight: 1.5, marginBottom: 22 }}>
                  Dr Kaur will see this on your summary at your next visit ({patient.nextReview}).
                </p>
                <div style={{ background: "var(--ivory)", borderRadius: 14, padding: 18, marginBottom: "auto" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Today’s entry</div>
                  {fields.map((f) => {
                    let d = answers[f.key];
                    if (f.type === "yesno") d = d ? "Yes" : "No";
                    if (f.type === "tags") d = (d || []).join(", ") || "—";
                    if (f.type === "hours") d = `${d}h`;
                    if (f.type === "scale") d = `${d}/10`;
                    return <div key={f.key} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--line)", fontSize: 13.5 }}>
                      <span className="muted" style={{ maxWidth: "62%" }}>{f.label}</span><strong>{d}</strong>
                    </div>;
                  })}
                </div>
                <div style={{ display: "flex", gap: 10, paddingTop: 18 }}>
                  <button className="btn btn-ghost" style={{ flex: 1, height: 48 }} onClick={() => setScreen("home")}>Back to home</button>
                  <Link href="/clinician" className="btn" style={{ flex: 1, height: 48, background: color, color: "#fff" }}>See clinician view →</Link>
                </div>
              </div>
            )}

            {/* ===== HISTORY ===== */}
            {screen === "history" && (
              <div className="fade" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ background: color, color: "#fff", padding: "20px 22px" }}>
                  <button onClick={() => setScreen("home")} style={{ color: "#fff", fontSize: 13, opacity: .85, marginBottom: 10 }}>← Home</button>
                  <div className="serif" style={{ fontSize: 20, fontWeight: 500 }}>Your history</div>
                  <div style={{ fontSize: 13, opacity: .8 }}>{loggedDays} check-ins over 90 days</div>
                </div>
                <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
                  {patient.symptoms.map((s) => (
                    <div key={s.key} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 14, marginBottom: 12 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>{s.name}</div>
                      <Spark data={patient.entries.map((e) => (e.logged ? e[s.key] : null))} color={color} w={320} h={40} />
                    </div>
                  ))}
                  {/* recent entries list */}
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", margin: "16px 0 10px" }}>Recent check-ins</div>
                  {patient.entries.filter((e) => e.logged).slice(-6).reverse().map((e, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                      <span style={{ fontSize: 13.5 }}>{e.label}</span>
                      <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span className="muted" style={{ fontSize: 12.5 }}>{primary.name} {e[primary.key]}{primary.unit}</span>
                        <span style={{ width: 8, height: 8, borderRadius: 100, background: e.took ? "var(--good)" : "var(--coral)" }} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== DEVICE ===== */}
            {screen === "device" && (
              <div className="fade" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ background: color, color: "#fff", padding: "20px 22px" }}>
                  <button onClick={() => setScreen("home")} style={{ color: "#fff", fontSize: 13, opacity: .85, marginBottom: 10 }}>← Home</button>
                  <div className="serif" style={{ fontSize: 20, fontWeight: 500 }}>Connected devices</div>
                  <div style={{ fontSize: 13, opacity: .8 }}>Optional — adds sleep & activity context</div>
                </div>
                <div style={{ padding: 20, flex: 1, overflowY: "auto" }}>
                  {patient.wearable && (
                    <div style={{ background: "var(--good-bg)", border: "1px solid #BFD9C8", borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ fontSize: 22 }}>⌚</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{patient.device}</div>
                        <div style={{ fontSize: 12.5, color: "var(--good)" }}>Connected · syncing daily</div>
                      </div>
                      <span style={{ fontSize: 12.5, color: "var(--good)", fontWeight: 600 }}>✓</span>
                    </div>
                  )}
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>{patient.wearable ? "Other devices" : "Available"}</div>
                  {[["Oura Ring", "Sleep, HRV, temperature"], ["Apple Watch", "Sleep, heart rate, activity"], ["Fitbit", "Sleep, steps, heart rate"], ["Garmin", "Sleep, stress, activity"]].filter(([n]) => n !== patient.device).map(([n, d]) => (
                    <div key={n} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--ivory)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⌚</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{n}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{d}</div>
                      </div>
                      <button style={{ fontSize: 12.5, fontWeight: 600, color, border: `1.5px solid ${color}`, borderRadius: 8, padding: "5px 12px" }}>Connect</button>
                    </div>
                  ))}
                  <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 14 }}>
                    A device is optional. Your daily check is what your clinician relies on — the wearable just adds extra detail when you have one.
                  </p>
                </div>
              </div>
            )}
          </Phone>

          <p className="muted" style={{ textAlign: "center", fontSize: 13, marginTop: 16, lineHeight: 1.5, maxWidth: 390 }}>
            A full patient app — home, daily check, streaks, history and devices. Switch condition above to see it adapt.
          </p>
        </div>
      </div>
    </main>
  );
}
