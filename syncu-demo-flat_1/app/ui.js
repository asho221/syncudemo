"use client";
import { useEffect, useState } from "react";

export function Logo({ light, size = 19 }) {
  const c = light ? "#fff" : "var(--teal)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <svg width={size * 1.35} height={size * 1.35} viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="12" stroke={c} strokeWidth="1.6" />
        <path d="M7 14.5c2-5 4-5 6 0s4 5 6 0" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </svg>
      <span className="serif" style={{ fontSize: size, fontWeight: 600, color: c, letterSpacing: "-.01em" }}>
        Sync U <span style={{ fontWeight: 400 }}>Health</span>
      </span>
    </div>
  );
}

// tiny inline sparkline (SVG)
export function Spark({ data, color = "var(--teal)", invert, w = 120, h = 34 }) {
  const vals = data.filter((v) => v != null);
  if (vals.length < 2) return <svg width={w} height={h} />;
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  let d = "";
  let started = false;
  data.forEach((v, i) => {
    if (v == null) return;
    const x = i * step;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    d += `${started ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)} `;
    started = true;
  });
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SevDot({ sev }) {
  const map = {
    action: "var(--coral)", attention: "var(--amber)", stable: "var(--good)", info: "var(--teal)",
  };
  return <span style={{ width: 8, height: 8, borderRadius: 100, background: map[sev], display: "inline-block", flexShrink: 0 }} />;
}

// count-up animation for numbers
export function CountUp({ value, suffix = "", dur = 700 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf, start;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, dur]);
  return <>{Math.round(n)}{suffix}</>;
}
