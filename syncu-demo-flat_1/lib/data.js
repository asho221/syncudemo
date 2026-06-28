// Demo data for Sync U — a panel of patients across three conditions, each with a
// distinct clinical story so the interpretation engine produces different output.
// All synthetic.

export const BRAND = {
  teal: "#0F4C5C", tealDeep: "#0A3540", ivory: "#F7F4EE", sand: "#EDE7DA",
  coral: "#C75D43", coralSoft: "#E8927B", ink: "#13262B", muted: "#5C6B70",
  good: "#2F6B4F", amber: "#B7791F", line: "#E3DDD0",
};

const TODAY = new Date("2026-06-12T00:00:00");
function lastNDates(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) { const d = new Date(TODAY); d.setDate(d.getDate() - i); out.push(d); }
  return out;
}
const DATES = lastNDates(90);
const fmt = (d) => d.toISOString().slice(0, 10);
const lab = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const Nz = (a) => (Math.random() - 0.5) * a;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function build(spec) {
  return DATES.map((d, i) => {
    const logged = Math.random() > spec.missLogRate(i);
    const row = { date: fmt(d), label: lab(d), logged };
    if (!logged) {
      spec.symptomKeys.forEach((k) => (row[k] = null));
      row.took = null; row.sideEffects = []; row.note = "";
      return row;
    }
    spec.symptoms(i, row);
    row.took = spec.took(i);
    row.sideEffects = spec.side ? spec.side(i, row) : [];
    row.note = spec.note ? spec.note(i) || "" : "";
    return row;
  });
}

function menopauseEntries() {
  return build({
    symptomKeys: ["flush", "sleep", "mood"],
    missLogRate: () => 0.06,
    symptoms: (i, row) => {
      const post = i >= 42;
      row.flush = +clamp(post ? 6.2 - (i - 42) * 0.11 + Nz(1.1) : 7 + Nz(1.4) - i * 0.02, 0.5, 10).toFixed(1);
      row.sleep = +clamp(post ? 5.2 + (i - 42) * 0.06 + Nz(1.0) : 4.6 + Nz(1.2) + i * 0.005, 2.5, 9).toFixed(1);
      row.mood = +clamp(post ? 5.0 - (i - 42) * 0.06 + Nz(1.2) : 5.4 + Nz(1.5) - i * 0.01, 0.5, 10).toFixed(1);
    },
    took: (i) => (i >= 50 && i <= 64 ? Math.random() > 0.55 : Math.random() > 0.08),
    side: (i) => (i >= 42 && i < 52 && Math.random() > 0.7 ? ["Breast tenderness"] : []),
    note: (i) => (i === 42 ? "Dose increased to 75mcg patch" : i === 7 ? "Flushes worst overnight, waking 3-4x" : i === 58 ? "Busy fortnight, forgot patch a few times" : ""),
  });
}

function pcosEntries() {
  return build({
    symptomKeys: ["energy", "cravings"],
    missLogRate: () => 0.10,
    symptoms: (i, row) => {
      row.energy = +clamp(4.4 + i * 0.012 + Nz(1.4), 1, 10).toFixed(1);
      row.cravings = +clamp(6.5 - i * 0.012 + Nz(1.6), 0.5, 10).toFixed(1);
      row.bleeding = ((i % 38) + 1) <= 4;
    },
    took: () => Math.random() > 0.40,
    side: (i, row) => (row.took && Math.random() > 0.82 ? ["Nausea after dose"] : []),
    note: (i) => (i === 0 ? "Started metformin 500mg + lifestyle plan" : i === 30 ? "Skin a little better; energy still low" : i === 70 ? "Struggling to take metformin consistently" : ""),
  });
}

function endoEntries() {
  return build({
    symptomKeys: ["pain", "fatigue", "bleedingScore"],
    missLogRate: () => 0.05,
    symptoms: (i, row) => {
      row.pain = +clamp(6.8 + Nz(1.3) - i * 0.004, 1, 10).toFixed(1);
      row.fatigue = +clamp(6.2 + Nz(1.2) - i * 0.003, 1, 10).toFixed(1);
      row.bleedingScore = +clamp(((i % 30) < 6 ? 6 : 2) + Nz(1.0), 0, 10).toFixed(1);
    },
    took: () => Math.random() > 0.06,
    side: (i) => (i < 30 && Math.random() > 0.78 ? ["Mood changes"] : i > 20 && Math.random() > 0.9 ? ["Headache"] : []),
    note: (i) => (i === 0 ? "Started on progestin therapy" : i === 25 ? "Pain no better, painkillers most days" : i === 55 ? "Missed two days of work this month" : i === 80 ? "Asking whether to consider other options" : ""),
  });
}

export const PATIENTS = {
  menopause: {
    id: "p-anita", name: "Anita Reddy", initials: "AR", age: 52, condition: "Menopause",
    conditionColor: BRAND.teal, treatment: "HRT — 75mcg estradiol patch + micronised progesterone",
    started: "12 weeks ago", startedShort: "12 wks", wearable: true, device: "Oura Ring",
    nextReview: "Tomorrow, 10:30", reviewIn: "1 day",
    entries: menopauseEntries(),
    symptoms: [
      { key: "flush", name: "Hot flushes", unit: "/10", invert: true },
      { key: "sleep", name: "Sleep", unit: "hrs", invert: false },
      { key: "mood", name: "Low mood", unit: "/10", invert: true },
    ],
    logFields: [
      { key: "flush", label: "Hot flushes & night sweats", type: "scale", lowLabel: "None", highLabel: "Severe" },
      { key: "sleep", label: "How many hours did you sleep?", type: "hours" },
      { key: "mood", label: "Mood today", type: "scale", lowLabel: "Good", highLabel: "Very low" },
      { key: "took", label: "Did you use your patch as prescribed?", type: "yesno" },
      { key: "sideEffects", label: "Any side effects?", type: "tags", options: ["Breast tenderness", "Headache", "Nausea", "Bleeding", "None"] },
    ],
  },
  pcos: {
    id: "p-leah", name: "Leah Morgan", initials: "LM", age: 29, condition: "PCOS",
    conditionColor: BRAND.coral, treatment: "Metformin 500mg + structured lifestyle plan",
    started: "12 weeks ago", startedShort: "12 wks", wearable: false, device: null,
    nextReview: "Thursday, 14:00", reviewIn: "6 days",
    entries: pcosEntries(),
    symptoms: [
      { key: "energy", name: "Energy", unit: "/10", invert: false },
      { key: "cravings", name: "Cravings", unit: "/10", invert: true },
    ],
    logFields: [
      { key: "energy", label: "Energy levels today", type: "scale", lowLabel: "Exhausted", highLabel: "Great" },
      { key: "cravings", label: "Sugar / carb cravings", type: "scale", lowLabel: "None", highLabel: "Intense" },
      { key: "bleeding", label: "Any bleeding today?", type: "yesno" },
      { key: "took", label: "Did you take your metformin?", type: "yesno" },
      { key: "sideEffects", label: "Any side effects?", type: "tags", options: ["Nausea after dose", "Bloating", "Headache", "None"] },
    ],
  },
  endo: {
    id: "p-priya", name: "Priya Anand", initials: "PA", age: 34, condition: "Endometriosis",
    conditionColor: "#6B3FA0", treatment: "Progestin therapy + analgesia as needed",
    started: "12 weeks ago", startedShort: "12 wks", wearable: true, device: "Apple Watch",
    nextReview: "Monday, 09:15", reviewIn: "3 days",
    entries: endoEntries(),
    symptoms: [
      { key: "pain", name: "Pelvic pain", unit: "/10", invert: true },
      { key: "fatigue", name: "Fatigue", unit: "/10", invert: true },
      { key: "bleedingScore", name: "Bleeding", unit: "/10", invert: true },
    ],
    logFields: [
      { key: "pain", label: "Pelvic pain today", type: "scale", lowLabel: "None", highLabel: "Severe" },
      { key: "fatigue", label: "Fatigue today", type: "scale", lowLabel: "None", highLabel: "Exhausted" },
      { key: "bleedingScore", label: "Bleeding today", type: "scale", lowLabel: "None", highLabel: "Heavy" },
      { key: "took", label: "Did you take your treatment?", type: "yesno" },
      { key: "sideEffects", label: "Any side effects?", type: "tags", options: ["Mood changes", "Headache", "Spotting", "None"] },
    ],
  },
};

export const PATIENT_LIST = ["menopause", "pcos", "endo"];
