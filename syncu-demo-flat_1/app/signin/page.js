"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "../ui";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [stage, setStage] = useState("form"); // form | verifying | role
  const [method, setMethod] = useState("");

  function go(via) {
    setMethod(via);
    setStage("verifying");
    setTimeout(() => setStage("role"), 1500);
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }} className="auth-grid">
      {/* left brand panel */}
      <div style={{ background: "var(--teal)", color: "#fff", padding: "48px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
        <Logo light />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="eyebrow" style={{ color: "var(--coral-soft)", marginBottom: 18 }}>Clinician & patient portal</div>
          <h1 className="serif" style={{ fontSize: 38, fontWeight: 500, lineHeight: 1.12, letterSpacing: "-.02em", maxWidth: 420 }}>
            The clinical record that exists between appointments.
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.7)", marginTop: 20, maxWidth: 400, lineHeight: 1.55 }}>
            Ninety days of how your patient actually did — symptoms, adherence, and wearable signals — read in the
            system you already use.
          </p>
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.55)" }}>
          ISO 27001 · UK GDPR · NHS DSP Toolkit aligned
        </div>
        {/* decorative wave */}
        <svg style={{ position: "absolute", bottom: -40, right: -40, opacity: .08 }} width="380" height="380" viewBox="0 0 100 100">
          <path d="M0 60 Q25 30 50 60 T100 60" stroke="#fff" strokeWidth="1" fill="none" />
          <path d="M0 70 Q25 40 50 70 T100 70" stroke="#fff" strokeWidth="1" fill="none" />
          <path d="M0 80 Q25 50 50 80 T100 80" stroke="#fff" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* right form panel */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40, background: "var(--ivory)" }}>
        <div style={{ width: 380, maxWidth: "100%" }}>
          {stage === "form" && (
            <div className="fade">
              <h2 className="serif" style={{ fontSize: 27, fontWeight: 500, marginBottom: 6 }}>Sign in</h2>
              <p className="muted" style={{ fontSize: 14.5, marginBottom: 26 }}>Welcome back. Access your dashboard.</p>

              <button onClick={() => go("nhs")} className="btn" style={{ width: "100%", justifyContent: "center", background: "#005EB8", color: "#fff", marginBottom: 10, height: 48 }}>
                Continue with NHS login
              </button>
              <button onClick={() => go("google")} className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", background: "#fff", marginBottom: 18, height: 48 }}>
                <svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"/></svg>
                Continue with Google
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 18px" }}>
                <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                <span className="muted" style={{ fontSize: 12.5 }}>or with email</span>
                <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
              </div>

              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@clinic.com" type="email"
                style={{ width: "100%", marginTop: 6, marginBottom: 14, padding: "11px 14px", border: "1.5px solid var(--line)", borderRadius: 9, fontSize: 14.5, fontFamily: "inherit", background: "#fff" }} />
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Password</label>
              <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" type="password"
                style={{ width: "100%", marginTop: 6, marginBottom: 8, padding: "11px 14px", border: "1.5px solid var(--line)", borderRadius: 9, fontSize: 14.5, fontFamily: "inherit", background: "#fff" }} />
              <div style={{ textAlign: "right", marginBottom: 18 }}>
                <span className="muted" style={{ fontSize: 13 }}>Forgot password?</span>
              </div>
              <button onClick={() => go("email")} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", height: 48 }}>
                Sign in
              </button>

              <p className="muted" style={{ fontSize: 13, textAlign: "center", marginTop: 22 }}>
                This is a demo — any details work. <Link href="/" style={{ color: "var(--coral)", fontWeight: 600 }}>Back to overview</Link>
              </p>
            </div>
          )}

          {stage === "verifying" && (
            <div className="fade" style={{ textAlign: "center", padding: "40px 0" }}>
              <div className="spinner" />
              <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, marginTop: 24 }}>
                {method === "nhs" ? "Verifying with NHS login…" : method === "google" ? "Connecting to Google…" : "Signing you in…"}
              </h2>
              <p className="muted" style={{ fontSize: 14, marginTop: 8 }}>Securing your session</p>
            </div>
          )}

          {stage === "role" && (
            <div className="fade">
              <h2 className="serif" style={{ fontSize: 26, fontWeight: 500, marginBottom: 6 }}>You're in.</h2>
              <p className="muted" style={{ fontSize: 14.5, marginBottom: 24 }}>This demo account has two roles. Choose a view.</p>

              <button onClick={() => router.push("/clinician")} style={{ width: "100%", textAlign: "left", background: "#fff", border: "1.5px solid var(--line)", borderRadius: 14, padding: 20, marginBottom: 14, cursor: "pointer", transition: "border-color .15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--teal)")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line)")}>
                <div className="pill pill-teal" style={{ marginBottom: 12 }}>Clinician</div>
                <div className="serif" style={{ fontSize: 19, fontWeight: 500, marginBottom: 4 }}>Open the clinician workspace</div>
                <div className="muted" style={{ fontSize: 14 }}>Your patient panel, between-visit summaries, and visit prep →</div>
              </button>

              <button onClick={() => router.push("/patient")} style={{ width: "100%", textAlign: "left", background: "#fff", border: "1.5px solid var(--line)", borderRadius: 14, padding: 20, cursor: "pointer", transition: "border-color .15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--coral)")} onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line)")}>
                <div className="pill pill-coral" style={{ marginBottom: 12 }}>Patient</div>
                <div className="serif" style={{ fontSize: 19, fontWeight: 500, marginBottom: 4 }}>Open the patient app</div>
                <div className="muted" style={{ fontSize: 14 }}>Your daily check, history, and connected devices →</div>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .spinner { width: 44px; height: 44px; border: 3px solid var(--sand); border-top-color: var(--teal); border-radius: 100px; margin: 0 auto; animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 820px) {
          .auth-grid { grid-template-columns: 1fr !important; }
          .auth-grid > div:first-child { display: none !important; }
        }
      `}</style>
    </main>
  );
}
