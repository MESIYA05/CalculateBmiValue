import React, { useEffect, useMemo, useRef, useState } from 'react';

/* ==========================================================================
   STYLES
   A light "vitals monitor" theme: clinical mint/white surface, a deep teal
   brand gradient standing in for "healthy / in range", and a coral trace
   reserved only for the heartbeat motif (the ECG strip + pulse rings) so it
   reads as a real signal rather than decoration.
   ========================================================================== */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

:root {
  --bg-canvas: #eaf4f2;
  --bg-canvas-2: #f8fbfa;
  --surface: #ffffff;
  --surface-muted: #f2f7f6;
  --line: rgba(13, 41, 38, 0.10);
  --line-strong: rgba(13, 41, 38, 0.20);

  --ink: #0d211f;
  --ink-dim: #5c716e;
  --ink-faint: #93a6a3;

  --brand-1: #0f766e;
  --brand-2: #2dd4bf;
  --grad-primary: linear-gradient(135deg, var(--brand-1), var(--brand-2));
  --vital: #e8543b;

  --cat-under: #2563eb;
  --cat-normal: #0f766e;
  --cat-over: #b45309;
  --cat-obese1: #c2410c;
  --cat-obese2: #dc2626;

  --radius-sm: 10px;
  --radius-md: 18px;
  --radius-lg: 26px;
  --radius-pill: 999px;

  --shadow-soft: 0 20px 44px -20px rgba(13, 41, 38, 0.28);
  --shadow-glow: 0 14px 30px -12px rgba(15, 118, 110, 0.45);

  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.22, 1, 0.36, 1);
  --dur: 0.25s;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html, body, #root { min-height: 100%; width: 100%; }

body {
  font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
  color: var(--ink);
  background:
    radial-gradient(circle at 10% 6%, rgba(45, 212, 191, 0.16), transparent 42%),
    radial-gradient(circle at 92% 94%, rgba(15, 118, 110, 0.14), transparent 46%),
    linear-gradient(180deg, var(--bg-canvas-2), var(--bg-canvas));
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-font-smoothing: antialiased;
}

.page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(16px, 4vw, 32px) 16px;
}

/* faint clinical grid texture, purely decorative */
.page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(15, 118, 110, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 118, 110, 0.05) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(circle at 50% 30%, black, transparent 75%);
  pointer-events: none;
}

/* ==========================================================================
   CARD
   ========================================================================== */

.card {
  position: relative;
  width: 100%;
  max-width: 460px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: clamp(18px, 4vw, 26px);
  box-shadow: var(--shadow-soft);
  animation: cardIn 0.6s var(--ease-spring) both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ==========================================================================
   HEADER
   ========================================================================== */

.card-header {
  text-align: center;
  margin-bottom: 6px;
}

.icon-badge {
  position: relative;
  width: 42px;
  height: 42px;
  margin: 0 auto 10px;
  border-radius: 50%;
  background: var(--grad-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-glow);
}

.icon-badge::before,
.icon-badge::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid var(--brand-2);
  animation: pulseRing 2.4s ease-out infinite;
}

.icon-badge::after {
  animation-delay: 1.2s;
}

@keyframes pulseRing {
  0% { transform: scale(1); opacity: 0.55; }
  75% { transform: scale(1.9); opacity: 0; }
  100% { transform: scale(1.9); opacity: 0; }
}

.card-header h1 {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: clamp(19px, 4vw, 23px);
  font-weight: 700;
  letter-spacing: -0.01em;
  margin-bottom: 4px;
  color: var(--ink);
}

.subtitle {
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-dim);
  max-width: 320px;
  margin: 0 auto;
}

/* ECG trace strip: two tiled copies of the same waveform scroll left in a
   seamless loop, standing in for the app "listening" for your reading. */
.ecg-strip {
  overflow: hidden;
  width: 100%;
  height: 20px;
  margin: 10px 0 16px;
  -webkit-mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent);
  mask-image: linear-gradient(90deg, transparent, black 12%, black 88%, transparent);
}

.ecg-track {
  width: 200%;
  height: 100%;
  display: block;
  animation: ecgScroll 5s linear infinite;
}

.ecg-path {
  fill: none;
  stroke: var(--vital);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.55;
}

@keyframes ecgScroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

/* ==========================================================================
   FORM
   ========================================================================== */

.bmi-form { display: flex; flex-direction: column; gap: 2px; }

.field { margin-bottom: 10px; }

.field label {
  display: block;
  font-size: 12.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-dim);
  margin-bottom: 6px;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--surface-muted);
  border: 1.5px solid var(--line-strong);
  border-radius: var(--radius-md);
  transition: border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease), background var(--dur) var(--ease);
}

.input-wrap:focus-within {
  background: #fff;
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.10);
}

.input-wrap--error { border-color: var(--cat-obese2); }

.input-wrap--error:focus-within {
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.12);
}

.input-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 15px;
  color: var(--ink-faint);
  transition: color var(--dur) var(--ease);
}

.input-wrap:focus-within .input-icon { color: var(--brand-1); }

.input-wrap input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  padding: 10px 12px 10px 10px;
  font-size: 15px;
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 500;
  color: var(--ink);
}

.input-wrap input::placeholder { color: var(--ink-faint); font-family: 'IBM Plex Sans', sans-serif; }

.input-wrap .unit {
  flex-shrink: 0;
  padding: 0 15px 0 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-faint);
  letter-spacing: 0.4px;
}

.field-error { min-height: 14px; margin-top: 4px; font-size: 12px; color: var(--cat-obese2); }

.form-error {
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.22);
  color: #9f1d1d;
  font-size: 13px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  margin: 4px 0 12px;
}

button:focus-visible {
  outline: 2px solid var(--brand-1);
  outline-offset: 2px;
}

.input-wrap input:focus {
  outline: none;
}

/* ==========================================================================
   ACTIONS
   ========================================================================== */

.actions { display: flex; gap: 10px; margin-top: 2px; }

.btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: none;
  border-radius: var(--radius-pill);
  padding: 11px 18px;
  font-family: inherit;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.1px;
  cursor: pointer;
  transition: transform var(--dur) var(--ease-spring), box-shadow var(--dur) var(--ease), background var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease);
}

.btn-primary { background: var(--grad-primary); color: #fff; box-shadow: var(--shadow-glow); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 18px 36px -14px rgba(15, 118, 110, 0.55); }

.btn-ghost { background: transparent; color: var(--ink-dim); border: 1.5px solid var(--line-strong); }
.btn-ghost:hover { color: var(--ink); border-color: var(--ink-faint); transform: translateY(-2px); }

.btn:active { transform: translateY(0); }

/* ==========================================================================
   RESULT
   ========================================================================== */

.result {
  margin-top: 16px;
  padding: 16px 18px;
  border-radius: var(--radius-md);
  background: var(--surface-muted);
  border: 1px solid var(--line);
  animation: resultIn 0.45s var(--ease-spring);
}

@keyframes resultIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.result-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.result-value { display: flex; align-items: baseline; gap: 8px; }

.result-number {
  font-family: 'IBM Plex Mono', monospace;
  font-size: clamp(28px, 7vw, 34px);
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

.result-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-faint);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.status-badge {
  position: relative;
  font-size: 12.5px;
  font-weight: 700;
  padding: 7px 16px;
  border-radius: var(--radius-pill);
  white-space: nowrap;
  animation: badgeBreathe 3.2s ease-in-out infinite;
}

@keyframes badgeBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.045); }
}

.status-badge--under  { color: var(--cat-under);  background: rgba(37, 99, 235, 0.10);  border: 1px solid rgba(37, 99, 235, 0.28); }
.status-badge--normal { color: var(--cat-normal); background: rgba(15, 118, 110, 0.10); border: 1px solid rgba(15, 118, 110, 0.28); }
.status-badge--over   { color: var(--cat-over);   background: rgba(180, 83, 9, 0.10);   border: 1px solid rgba(180, 83, 9, 0.28); }
.status-badge--obese1 { color: var(--cat-obese1); background: rgba(194, 65, 12, 0.10);  border: 1px solid rgba(194, 65, 12, 0.28); }
.status-badge--obese2 { color: var(--cat-obese2); background: rgba(220, 38, 38, 0.10);  border: 1px solid rgba(220, 38, 38, 0.28); }

.result-note { font-size: 13px; line-height: 1.55; color: var(--ink-dim); margin-bottom: 12px; }

.gauge-track {
  position: relative;
  height: 8px;
  border-radius: var(--radius-pill);
  background: linear-gradient(
    90deg,
    var(--cat-under) 0%, var(--cat-under) 28.3%,
    var(--cat-normal) 28.3%, var(--cat-normal) 50%,
    var(--cat-over) 50%, var(--cat-over) 66.7%,
    var(--cat-obese1) 66.7%, var(--cat-obese1) 83.3%,
    var(--cat-obese2) 83.3%, var(--cat-obese2) 100%
  );
  opacity: 0.9;
}

.gauge-marker {
  position: absolute;
  top: 50%;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid var(--brand-1);
  box-shadow: 0 3px 8px rgba(13, 41, 38, 0.35);
  transform: translate(-50%, -50%);
  transition: left 0.6s var(--ease-spring);
}

.gauge-marker::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid var(--brand-1);
  animation: markerPulse 1.8s ease-out infinite;
}

@keyframes markerPulse {
  0% { transform: scale(0.6); opacity: 0.7; }
  70% { transform: scale(2); opacity: 0; }
  100% { opacity: 0; }
}

.gauge-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--ink-faint);
  letter-spacing: 0.2px;
}

/* ==========================================================================
   DISCLAIMER
   ========================================================================== */

.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 14px;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--ink-faint);
}

.disclaimer svg { flex-shrink: 0; margin-top: 1.5px; }

/* ==========================================================================
   RESPONSIVE + ACCESSIBILITY
   ========================================================================== */

@media (max-width: 480px) {
  .card { padding: 16px 16px; border-radius: var(--radius-md); }
  .actions { flex-direction: column; }
  .gauge-labels span:nth-child(2), .gauge-labels span:nth-child(3) { font-size: 9.5px; }
}

@media (max-width: 340px) {
  .result-top { flex-direction: column; align-items: flex-start; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
`;

/* ==========================================================================
   DATA
   ========================================================================== */

const BMI_CATEGORIES = [
  { label: 'Underweight', max: 18.5, tone: 'under', note: 'Below the typical range — extra calories and nutrients may help.' },
  { label: 'Normal weight', max: 25, tone: 'normal', note: 'Within the typical healthy range for most adults.' },
  { label: 'Overweight', max: 30, tone: 'over', note: 'Above the typical range — small lifestyle changes can help.' },
  { label: 'Obese Class I', max: 35, tone: 'obese1', note: 'Well above the typical range — consider speaking with a doctor.' },
  { label: 'Obese Class II', max: Infinity, tone: 'obese2', note: "Significantly above the typical range — a doctor's guidance is recommended." },
];

const GAUGE_MIN = 10;
const GAUGE_MAX = 40;

const getCategory = (bmiValue) => BMI_CATEGORIES.find((c) => bmiValue < c.max) ?? BMI_CATEGORIES[BMI_CATEGORIES.length - 1];

/* ==========================================================================
   ICONS
   ========================================================================== */

const IconStethoscope = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M6 3V9.2C6 11.85 8.24 14 11 14C13.76 14 16 11.85 16 9.2V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M6 3H4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M16 3H17.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M11 14V17.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="11" cy="19.4" r="2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="19" cy="9.2" r="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M16 9.2H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const IconWeight = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="13.5" r="4" stroke="currentColor" strokeWidth="1.7" />
    <path d="M12 13.5L14.2 10.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M8 7H10.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const IconRuler = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="4" y="7" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M8 7V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M12 7V10.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M16 7V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const IconRefresh = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M4 12a8 8 0 0 1 13.66-5.66" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M20 12a8 8 0 0 1-13.66 5.66" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M17 3v4h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 21v-4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconInfo = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
    <path d="M12 11v5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="12" cy="8" r="0.9" fill="currentColor" />
  </svg>
);

/* Two tiled copies of one heartbeat-blip path, scrolled left in a loop. */
const ECG_TILE = 'M0,20 H100 L112,20 L120,4 L128,34 L136,10 L144,24 L152,20 H300';

const EcgTrace = () => (
  <div className="ecg-strip" aria-hidden="true">
    <svg className="ecg-track" viewBox="0 0 600 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path className="ecg-path" d={ECG_TILE} />
      <path className="ecg-path" d={ECG_TILE} transform="translate(300,0)" />
    </svg>
  </div>
);

/* ==========================================================================
   APP
   ========================================================================== */

const BmiHealthCheck = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiStatus, setBmiStatus] = useState('');
  const [bmiTone, setBmiTone] = useState('normal');
  const [bmiNote, setBmiNote] = useState('');
  const [formError, setFormError] = useState('');
  const [weightError, setWeightError] = useState('');
  const [heightError, setHeightError] = useState('');
  const [displayBmi, setDisplayBmi] = useState(0);

  const rafRef = useRef(null);

  const calculateBmi = (e) => {
    e?.preventDefault();

    if (!weight.trim() || !height.trim()) {
      setFormError('Please enter both your weight and height.');
      setWeightError('');
      setHeightError('');
      setBmi(null);
      setBmiStatus('');
      setBmiNote('');
      return;
    }

    const weightValue = parseFloat(weight);
    const heightValue = parseFloat(height);

    const nextWeightError = Number.isNaN(weightValue) || weightValue <= 0 ? 'Enter a valid weight in kg.' : '';
    const nextHeightError = Number.isNaN(heightValue) || heightValue <= 0 ? 'Enter a valid height in cm.' : '';

    setWeightError(nextWeightError);
    setHeightError(nextHeightError);

    if (nextWeightError || nextHeightError) {
      setBmi(null);
      setBmiStatus('');
      setBmiNote('');
      setFormError('');
      return;
    }

    const heightMeters = heightValue / 100;
    const bmiValue = weightValue / (heightMeters * heightMeters);
    const category = getCategory(bmiValue);

    setBmi(bmiValue.toFixed(1));
    setBmiStatus(category.label);
    setBmiTone(category.tone);
    setBmiNote(category.note);
    setFormError('');
  };

  const clear = () => {
    setWeight('');
    setHeight('');
    setBmi(null);
    setBmiStatus('');
    setBmiNote('');
    setFormError('');
    setWeightError('');
    setHeightError('');
  };

  // Animate the readout counting up to its target, like a monitor settling
  // on a reading, rather than snapping straight to the final number.
  useEffect(() => {
    if (bmi == null) {
      setDisplayBmi(0);
      return;
    }
    const target = parseFloat(bmi);
    const duration = 700;
    const start = performance.now();

    cancelAnimationFrame(rafRef.current);
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayBmi(target * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayBmi(target);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [bmi]);

  const gaugePercent = useMemo(() => {
    if (bmi == null) return null;
    const clamped = Math.min(GAUGE_MAX, Math.max(GAUGE_MIN, parseFloat(bmi)));
    return ((clamped - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100;
  }, [bmi]);

  return (
    <>
      <style>{styles}</style>
      <div className="page">
        <div className="card">
          <header className="card-header">
            <div className="icon-badge">
              <IconStethoscope />
            </div>
            <h1>BMI Health Check</h1>
            <p className="subtitle">Enter your weight and height for an instant reading of your Body Mass Index.</p>
          </header>

          <EcgTrace />

          <form className="bmi-form" onSubmit={calculateBmi} noValidate>
            <div className="field">
              <label htmlFor="weight">Weight</label>
              <div className={`input-wrap ${weightError ? 'input-wrap--error' : ''}`}>
                <span className="input-icon">
                  <IconWeight />
                </span>
                <input
                  id="weight"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="e.g. 68"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  aria-invalid={Boolean(weightError)}
                  aria-describedby="weight-error"
                />
                <span className="unit">kg</span>
              </div>
              <p className="field-error" id="weight-error">{weightError}</p>
            </div>

            <div className="field">
              <label htmlFor="height">Height</label>
              <div className={`input-wrap ${heightError ? 'input-wrap--error' : ''}`}>
                <span className="input-icon">
                  <IconRuler />
                </span>
                <input
                  id="height"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="e.g. 170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  aria-invalid={Boolean(heightError)}
                  aria-describedby="height-error"
                />
                <span className="unit">cm</span>
              </div>
              <p className="field-error" id="height-error">{heightError}</p>
            </div>

            {formError && (
              <p className="form-error" role="alert">{formError}</p>
            )}

            <div className="actions">
              <button type="submit" className="btn btn-primary">Calculate</button>
              <button type="button" className="btn btn-ghost" onClick={clear}>
                <IconRefresh />
                <span>Reset</span>
              </button>
            </div>
          </form>

          {bmi != null && (
            <section className={`result result--${bmiTone}`} aria-live="polite">
              <div className="result-top">
                <div className="result-value">
                  <span className="result-number">{displayBmi.toFixed(1)}</span>
                  <span className="result-label">BMI</span>
                </div>
                <span className={`status-badge status-badge--${bmiTone}`}>{bmiStatus}</span>
              </div>

              <p className="result-note">{bmiNote}</p>

              <div className="gauge">
                <div className="gauge-track">
                  <span className="gauge-marker" style={{ left: `${gaugePercent}%` }} aria-hidden="true" />
                </div>
                <div className="gauge-labels">
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
              </div>
            </section>
          )}

          <p className="disclaimer">
            <IconInfo />
            <span>For informational purposes only — not a substitute for professional medical advice.</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default BmiHealthCheck;