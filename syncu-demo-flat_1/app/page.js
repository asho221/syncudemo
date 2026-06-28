"use client";
import Link from "next/link";
import { useState } from "react";
import { PATIENTS } from "../lib/data";

function Logo({ light }) {
  const c = light ? "#fff" : "var(--teal)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="12" stroke={c} strokeWidth="1.6" />
        <path d="M7 14.5c2-5 4-5 6 0s4 5 6 0" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </svg>
      <span className="serif" style={{ fontSize: 19, fontWeight: 600, color: c, letterSpacing: "-.01em" }}>
        Sync U <span style={{ fontWeight: 400 }}>Health</span>
      </span>
    </div>
  );
}

export default function Home() {
  const [hover, setHover] = useState(null);

  return (
    <main style={{ minHeight: "100vh" }}>
      {/* top bar */}
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 76 }}>
        <Logo />
        <span className="pill pill-coral">Interactive demo</span>
      </div>

      {/* hero */}
      <section className="wrap fade" style={{ paddingTop: 48, paddingBottom: 20, maxWidth: 880 }}>
        <div className="eyebrow" style={{ marginBottom: 18 }}>The record that exists between appointments</div>
        <h1 className="serif" style={{ fontSize: "clamp(34px, 5.2vw, 58px)", lineHeight: 1.04, fontWeight: 500, letterSpacing: "-.02em", color: "var(--ink)" }}>
          A clinician adjusts treatment every twelve weeks —{" "}
          <span style={{ color: "var(--teal)" }}>on seven days of memory.</span>
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.55, color: "var(--muted)", marginTop: 22, maxWidth: 660 }}>
          Sync U captures how a patient actually does between visits — symptoms, side effects, and whether
          they followed the treatment — and turns it into one page the clinician reads inside their existing system.
          This is a walkthrough of how it works.
        </p>
      </section>

      {/* the two entries */}
      <section className="wrap fade-2" style={{ paddingTop: 30, paddingBottom: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="entry-grid">
          {/* patient side */}
          <Link href="/patient" style={{ display: "block" }}>
            <div
              className="card"
              onMouseEnter={() => setHover("p")}
              onMouseLeave={() => setHover(null)}
              style={{ padding: 30, height: "100%", transition: "transform .15s, box-shadow .15s", transform: hover === "p" ? "translateY(-3px)" : "none", boxShadow: hover === "p" ? "var(--shadow-lg)" : "var(--shadow)" }}
            >
              <div className="pill pill-teal" style={{ marginBottom: 18 }}>① The patient</div>
              <h2 className="serif" style={{ fontSize: 25, fontWeight: 500, marginBottom: 10 }}>The 90-second daily check</h2>
              <p className="muted" style={{ fontSize: 15.5, lineHeight: 1.55, marginBottom: 22 }}>
                See what a patient does each day at home — a few taps on how they feel and whether they
                took their treatment. No clinical knowledge needed.
              </p>
              <span className="btn btn-primary" style={{ fontSize: 14.5, padding: "10px 18px" }}>
                Open the patient app →
              </span>
            </div>
          </Link>

          {/* clinician side */}
          <Link href="/clinician" style={{ display: "block" }}>
            <div
              className="card"
              onMouseEnter={() => setHover("c")}
              onMouseLeave={() => setHover(null)}
              style={{ padding: 30, height: "100%", transition: "transform .15s, box-shadow .15s", transform: hover === "c" ? "translateY(-3px)" : "none", boxShadow: hover === "c" ? "var(--shadow-lg)" : "var(--shadow)" }}
            >
              <div className="pill pill-coral" style={{ marginBottom: 18 }}>② The clinician</div>
              <h2 className="serif" style={{ fontSize: 25, fontWeight: 500, marginBottom: 10 }}>The one-page summary</h2>
              <p className="muted" style={{ fontSize: 15.5, lineHeight: 1.55, marginBottom: 22 }}>
                See what the clinician opens before the appointment — 90 days of the patient’s data on one page,
                inside the software they already use.
              </p>
              <span className="btn btn-coral" style={{ fontSize: 14.5, padding: "10px 18px" }}>
                Open the clinician view →
              </span>
            </div>
          </Link>
        </div>

        {/* both conditions note */}
        <div style={{ marginTop: 28, padding: "18px 22px", background: "var(--sand)", borderRadius: 12, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>Same product, two conditions:</span>
          <span className="pill pill-teal">Menopause · {PATIENTS.menopause.name}</span>
          <span className="pill pill-coral">PCOS · {PATIENTS.pcos.name}</span>
          <span className="muted" style={{ fontSize: 14, marginLeft: "auto" }}>
            The engine doesn’t change — only the questions it asks.
          </span>
        </div>
      </section>

      {/* how it fits */}
      <section style={{ background: "var(--teal)", color: "#fff", marginTop: 30 }}>
        <div className="wrap" style={{ padding: "54px 24px" }}>
          <div className="eyebrow" style={{ color: "var(--coral-soft)", marginBottom: 26 }}>How it fits together</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22 }} className="flow-grid">
            {[
              ["Patient logs", "A 90-second daily check — symptoms, side effects, and whether they took the treatment."],
              ["Sync U structures", "Ninety days of that becomes one clean, readable picture — trends, not raw entries."],
              ["Clinician decides", "The summary appears inside their existing system before the visit. They decide. We don’t diagnose."],
            ].map(([t, d], i) => (
              <div key={i}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--coral-soft)", marginBottom: 10 }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="serif" style={{ fontSize: 21, fontWeight: 500, marginBottom: 8 }}>{t}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.55, color: "rgba(255,255,255,.72)" }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="wrap" style={{ padding: "30px 24px 50px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Logo />
        <span className="muted" style={{ fontSize: 13 }}>
          Demo with synthetic data · No real patient information · © Sync U Health 2026
        </span>
      </footer>

      <style>{`
        @media (max-width: 760px) {
          .entry-grid { grid-template-columns: 1fr !important; }
          .flow-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>
    </main>
  );
}
