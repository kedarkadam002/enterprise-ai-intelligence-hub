import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTip, ResponsiveContainer, ReferenceLine, ScatterChart,
  Scatter, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle, TrendingUp, DollarSign, Activity, ShieldCheck,
  SlidersHorizontal, RefreshCw, ChevronRight, Zap, XCircle,
} from "lucide-react";

/* ─────────────────────────── helpers ─────────────────────────── */

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function fmt(n: number, decimals = 1) { return n.toFixed(decimals); }
function fmtB(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`;
  return `$${n.toFixed(0)}M`;
}

/* ─────────────────────────── derived KPIs ─────────────────────── */

function deriveKPIs(sens: number, fpTol: number, confCut: number, sevIdx: number, volCap: number) {
  // sens: 50–100, fpTol: 1–20, confCut: 50–95, sevIdx: 0–3, volCap: 50–500
  const st = (sens - 50) / 50;          // 0→1
  const ct = (confCut - 50) / 45;       // 0→1
  const ft = (fpTol - 1) / 19;          // 0→1  (higher tol → more FP allowed)
  const sv = sevIdx / 3;                 // 0→1

  // Detection rate: high sens + low conf cut = higher recall. FP tol doesn't help detection.
  const detectionRate = clamp(94 + st * 5.5 - ct * 1.5 + ft * 0.5, 88, 99.97);

  // False positive rate: more sensitivity → more FP; higher conf cut reduces FP; more tolerance allows them
  const fpRate = clamp(8 - st * 4 + ct * 2 - ft * 3.5 + sv * 1, 0.5, 18);

  // Alerts per minute: more sensitivity, lower confidence, lower severity filter = more alerts
  const alertsPerMin = clamp(
    Math.round(volCap * (0.3 + st * 0.4 + (1 - ct) * 0.25 + (1 - sv) * 0.3)),
    5, volCap
  );

  // Value protected: better detection at cost of lower confidence → slightly lower $ per alert
  const valueProt = clamp(lerp(2400, 5800, st * 0.6 + (1 - ct) * 0.2 + ft * 0.1), 2000, 6200);

  // True positives blocked
  const truePositives = Math.round(alertsPerMin * (1 - fpRate / 100));

  // Latency: more complex model (high conf) = slightly higher latency
  const latencyMs = clamp(Math.round(80 + ct * 180 + st * 40), 80, 340);

  // Precision & Recall
  const precision = clamp(100 - fpRate * 1.2, 72, 99.5);
  const recall = clamp(detectionRate - (1 - ft) * 2, 84, 99.97);

  return { detectionRate, fpRate, alertsPerMin, valueProt, truePositives, latencyMs, precision, recall };
}

/* ─────────────────────────── chart data generators ──────────────── */

function buildHourlyData(sens: number, volCap: number, sevIdx: number) {
  const hours = ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"];
  const pattern = [0.3, 0.2, 0.15, 0.2, 0.55, 0.85, 1, 0.9, 0.95, 0.8, 0.6, 0.45];
  const factor = 0.5 + (sens - 50) / 100;
  return hours.map((h, i) => {
    const base = Math.round(volCap * factor * pattern[i]);
    const critical = sevIdx <= 0 ? Math.round(base * 0.12) : 0;
    const high = sevIdx <= 1 ? Math.round(base * 0.25) : 0;
    const medium = sevIdx <= 2 ? Math.round(base * 0.38) : 0;
    const low = sevIdx <= 3 ? base - critical - high - medium : 0;
    return { hour: h + ":00", total: base, critical, high, medium, low: Math.max(0, low) };
  });
}

function buildRocCurve() {
  // Fixed ROC curve for reference — sensitivity acts as operating point
  return [
    { fpr: 0, tpr: 0 }, { fpr: 2, tpr: 72 }, { fpr: 4, tpr: 84 },
    { fpr: 6, tpr: 91 }, { fpr: 8, tpr: 94.5 }, { fpr: 10, tpr: 96.5 },
    { fpr: 13, tpr: 97.8 }, { fpr: 16, tpr: 98.7 }, { fpr: 20, tpr: 99.4 },
  ];
}

function buildIndustryData(sens: number, sevIdx: number) {
  const scale = 0.6 + (sens - 50) / 125;
  const sf = sevIdx === 0 ? 0.55 : sevIdx === 1 ? 0.75 : sevIdx === 2 ? 0.9 : 1.0;
  return [
    { name: "BFSI", caught: Math.round(1840 * scale * sf), missed: Math.round(140 * (1 - scale * 0.6)) },
    { name: "Healthcare", caught: Math.round(1220 * scale * sf), missed: Math.round(95 * (1 - scale * 0.6)) },
    { name: "Energy", caught: Math.round(680 * scale * sf), missed: Math.round(55 * (1 - scale * 0.6)) },
  ];
}

/* ─────────────────────────── alert feed ─────────────────────────── */

type Severity = "critical" | "high" | "medium" | "low";
interface Alert { id: string; sev: Severity; msg: string; entity: string; score: number; ts: string; }

const ALERT_TEMPLATES: { sev: Severity; msgs: string[] }[] = [
  { sev: "critical", msgs: ["Synthetic identity ring detected", "AML structuring pattern — $480K", "Card skimming cluster — 214 cards", "Insider threat: data exfiltration"] },
  { sev: "high", msgs: ["Velocity anomaly — 38 txns/min", "Claims upcoding detected — 3 providers", "Meter bypass — GPS cluster", "Account takeover attempt"] },
  { sev: "medium", msgs: ["Unusual login location", "Provider billing outlier", "Smart meter data gap", "Duplicate claim submission"] },
  { sev: "low", msgs: ["Minor velocity check", "Address mismatch flagged", "Low-confidence anomaly", "Periodic re-score trigger"] },
];

const ENTITIES = [
  "ACC-881234", "PROV-44821", "MTR-009321", "CARD-77523", "CLM-320481",
  "ENT-110043", "TXN-998812", "ACC-556134", "PROV-81332", "USER-34512",
];

let alertSeq = 1000;
function makeAlert(sevIdx: number): Alert {
  const sev: Severity = sevIdx === 0 ? "critical" : sevIdx === 1 ? "high" : sevIdx === 2 ? "medium" : "low";
  // Pick severity equal to or higher than the filter
  const choices = ALERT_TEMPLATES.slice(0, sevIdx + 1 === 0 ? 1 : sevIdx + 1);
  const pool = choices[Math.floor(Math.random() * choices.length)];
  const msg = pool.msgs[Math.floor(Math.random() * pool.msgs.length)];
  const entity = ENTITIES[Math.floor(Math.random() * ENTITIES.length)];
  const score = sevIdx === 0 ? clamp(Math.round(90 + Math.random() * 9), 90, 99)
    : sevIdx === 1 ? clamp(Math.round(75 + Math.random() * 14), 75, 89)
    : sevIdx === 2 ? clamp(Math.round(55 + Math.random() * 19), 55, 74)
    : clamp(Math.round(30 + Math.random() * 24), 30, 54);
  const now = new Date();
  const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  return { id: String(alertSeq++), sev: pool.sev, msg, entity, score, ts };
}

const SEV_COLOR: Record<Severity, string> = {
  critical: "text-rose-400 border-rose-400/30 bg-rose-400/10",
  high: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  medium: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  low: "text-slate-400 border-slate-400/20 bg-slate-400/8",
};
const SEV_DOT: Record<Severity, string> = {
  critical: "bg-rose-400", high: "bg-amber-400", medium: "bg-blue-400", low: "bg-slate-400",
};
const SEV_BAR_COLOR: Record<string, string> = {
  critical: "#f43f5e", high: "#f59e0b", medium: "#3b82f6", low: "#64748b",
};

const SEV_LABELS = ["Critical only", "High+", "Medium+", "All alerts"];

/* ─────────────────────────── slider component ─────────────────── */

function Slider({ label, value, min, max, step = 1, unit = "", onChange, color = "#06B6D4" }: {
  label: string; value: number; min: number; max: number; step?: number;
  unit?: string; onChange: (v: number) => void; color?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white/70">{label}</span>
        <span className="text-sm font-mono font-bold" style={{ color }}>{value}{unit}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="relative w-full h-1.5 rounded-full bg-white/10">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: color + "80" }}
          />
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ WebkitAppearance: "none" }}
        />
        <div
          className="absolute w-4 h-4 rounded-full border-2 shadow-lg transition-all pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)`, backgroundColor: color, borderColor: color }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────── main page ─────────────────────────── */

export default function Dashboard() {
  const [sens, setSens] = useState(75);           // detection sensitivity 50–100
  const [fpTol, setFpTol] = useState(8);          // false positive tolerance 1–20
  const [confCut, setConfCut] = useState(72);     // ML confidence cutoff 50–95
  const [sevIdx, setSevIdx] = useState(2);        // severity: 0=critical 1=high 2=medium 3=low
  const [volCap, setVolCap] = useState(250);      // max alerts/min 50–500
  const [alerts, setAlerts] = useState<Alert[]>(() =>
    Array.from({ length: 8 }, () => makeAlert(2))
  );
  const [paused, setPaused] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const kpi = deriveKPIs(sens, fpTol, confCut, sevIdx, volCap);
  const hourlyData = buildHourlyData(sens, volCap, sevIdx);
  const industryData = buildIndustryData(sens, sevIdx);
  const rocData = buildRocCurve();
  const operatingPoint = { fpr: kpi.fpRate, tpr: kpi.detectionRate };

  // Live alert feed — new alert every few seconds based on alertsPerMin
  useEffect(() => {
    if (paused) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    const ms = Math.max(800, Math.round(60000 / kpi.alertsPerMin));
    intervalRef.current = setInterval(() => {
      const newAlert = makeAlert(sevIdx);
      setAlerts(prev => [newAlert, ...prev].slice(0, 20));
    }, ms);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, kpi.alertsPerMin, sevIdx]);

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => new Set([...prev, id]));
  }, []);

  const visibleAlerts = alerts.filter(a => !dismissed.has(a.id));

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Executive Command Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time intelligence · Adjust thresholds to see KPI impact instantly</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            Live
          </div>
          <button
            onClick={() => setPaused(p => !p)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              paused ? "border-amber-400/30 text-amber-400 bg-amber-400/10" : "border-white/10 text-white/60 hover:border-white/20"
            }`}
          >
            {paused ? <><RefreshCw className="h-3 w-3" /> Resume</> : <><RefreshCw className="h-3 w-3" /> Pause Feed</>}
          </button>
        </div>
      </div>

      <div className="grid xl:grid-cols-[300px_1fr] gap-6">
        {/* ── Control Panel ── */}
        <div className="space-y-4">
          <Card className="bg-card/50 border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Threshold Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Slider label="Detection Sensitivity" value={sens} min={50} max={100} unit="%" onChange={setSens} color="#06B6D4" />
              <Slider label="False Positive Tolerance" value={fpTol} min={1} max={20} unit="%" onChange={setFpTol} color="#F59E0B" />
              <Slider label="ML Confidence Cutoff" value={confCut} min={50} max={95} unit="%" onChange={setConfCut} color="#8B5CF6" />
              <Slider label="Alert Volume Cap" value={volCap} min={50} max={500} step={10} unit="/min" onChange={setVolCap} color="#10B981" />

              {/* Severity selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/70">Severity Filter</span>
                  <span className="text-xs font-mono font-bold text-rose-400">{SEV_LABELS[sevIdx]}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {SEV_LABELS.map((label, i) => (
                    <button
                      key={i}
                      onClick={() => setSevIdx(i)}
                      className={`py-1.5 px-1 rounded-md text-xs font-medium transition-all ${
                        sevIdx === i
                          ? i === 0 ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : i === 1 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : i === 2 ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                          : "bg-white/5 text-white/40 border border-white/5 hover:border-white/15"
                      }`}
                    >
                      {["Crit", "High", "Med", "All"][i]}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Precision / Recall mini table */}
          <Card className="bg-card/50 border-white/10">
            <CardContent className="pt-4 pb-4 space-y-2">
              <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Model Performance</div>
              {[
                { label: "Precision", value: kpi.precision, color: "#06B6D4" },
                { label: "Recall", value: kpi.recall, color: "#10B981" },
                { label: "F1 Score", value: 2 * kpi.precision * kpi.recall / (kpi.precision + kpi.recall), color: "#8B5CF6" },
                { label: "Latency (P99)", value: null, raw: `${kpi.latencyMs}ms`, color: "#F59E0B" },
              ].map(m => (
                <div key={m.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">{m.label}</span>
                    <span className="font-mono font-bold" style={{ color: m.color }}>
                      {m.raw ?? `${fmt(m.value!)}%`}
                    </span>
                  </div>
                  {!m.raw && (
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: m.color + "80" }}
                        animate={{ width: `${m.value}%` }}
                        transition={{ type: "spring", stiffness: 80, damping: 18 }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ── Main Content ── */}
        <div className="space-y-5">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Detection Rate", icon: ShieldCheck, color: "text-emerald-400", iconBg: "bg-emerald-400/10",
                value: `${fmt(kpi.detectionRate)}%`, trend: kpi.detectionRate > 97 ? "+↑" : kpi.detectionRate > 93 ? "~" : "↓",
                trendColor: kpi.detectionRate > 97 ? "text-emerald-400" : kpi.detectionRate > 93 ? "text-amber-400" : "text-rose-400" },
              { label: "False Positive Rate", icon: AlertCircle, color: "text-rose-400", iconBg: "bg-rose-400/10",
                value: `${fmt(kpi.fpRate)}%`, trend: kpi.fpRate < 4 ? "↓ Low" : kpi.fpRate < 10 ? "~" : "↑ High",
                trendColor: kpi.fpRate < 4 ? "text-emerald-400" : kpi.fpRate < 10 ? "text-amber-400" : "text-rose-400" },
              { label: "Alerts / Min", icon: Zap, color: "text-amber-400", iconBg: "bg-amber-400/10",
                value: String(kpi.alertsPerMin), trend: `${kpi.truePositives} real`,
                trendColor: "text-white/40" },
              { label: "Value Protected", icon: DollarSign, color: "text-primary", iconBg: "bg-primary/10",
                value: fmtB(kpi.valueProt), trend: "YTD ↑24%", trendColor: "text-emerald-400" },
            ].map((kpiCard, i) => (
              <motion.div key={kpiCard.label} layout>
                <Card className="bg-card/40 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground">{kpiCard.label}</span>
                      <div className={`w-7 h-7 rounded-lg ${kpiCard.iconBg} flex items-center justify-center`}>
                        <kpiCard.icon className={`h-3.5 w-3.5 ${kpiCard.color}`} />
                      </div>
                    </div>
                    <motion.div
                      key={kpiCard.value}
                      initial={{ opacity: 0.4, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-2xl font-mono font-bold text-white"
                    >
                      {kpiCard.value}
                    </motion.div>
                    <div className={`text-xs mt-1 ${kpiCard.trendColor}`}>{kpiCard.trend}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Hourly alert volume */}
            <Card className="bg-card/40 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white">Alert Volume by Hour (24h)</CardTitle>
              </CardHeader>
              <CardContent className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData} barSize={8}>
                    <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 9 }} interval={1} />
                    <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 9 }} />
                    <RechartsTip
                      contentStyle={{ backgroundColor: "#0d1523", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
                    />
                    {sevIdx <= 0 && <Bar dataKey="critical" stackId="a" fill={SEV_BAR_COLOR.critical} radius={[0, 0, 0, 0]} />}
                    {sevIdx <= 1 && <Bar dataKey="high" stackId="a" fill={SEV_BAR_COLOR.high} />}
                    {sevIdx <= 2 && <Bar dataKey="medium" stackId="a" fill={SEV_BAR_COLOR.medium} />}
                    {sevIdx <= 3 && <Bar dataKey="low" stackId="a" fill={SEV_BAR_COLOR.low} radius={[3, 3, 0, 0]} />}
                    <ReferenceLine y={volCap * 0.9} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: "Cap", position: "insideTopRight", fill: "#f43f5e", fontSize: 9 }} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Industry breakdown */}
            <Card className="bg-card/40 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-white">Industry Alert Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={industryData} layout="vertical" barSize={14}>
                    <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 9 }} />
                    <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 10 }} width={60} />
                    <RechartsTip
                      contentStyle={{ backgroundColor: "#0d1523", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
                    />
                    <Bar dataKey="caught" name="Caught" fill="#06B6D4" radius={[0, 3, 3, 0]} />
                    <Bar dataKey="missed" name="Missed" fill="#f43f5e40" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* ROC operating point + Alert Feed */}
          <div className="grid lg:grid-cols-[1fr_340px] gap-5">
            {/* ROC curve */}
            <Card className="bg-card/40 border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white">ROC Curve — Operating Point</CardTitle>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="w-3 h-px bg-primary inline-block" /> Model curve</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Your settings</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 4, right: 4, bottom: 4, left: -12 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" dataKey="fpr" name="False Positive Rate" domain={[0, 20]}
                      label={{ value: "FP Rate (%)", position: "insideBottom", offset: -2, fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
                      stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 9 }} />
                    <YAxis type="number" dataKey="tpr" name="Detection Rate" domain={[0, 100]}
                      label={{ value: "Detection (%)", angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
                      stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 9 }} />
                    <RechartsTip
                      contentStyle={{ backgroundColor: "#0d1523", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }}
                      formatter={(v: number, n: string) => [`${fmt(v)}%`, n === "fpr" ? "FP Rate" : "Detection Rate"]}
                    />
                    {/* ROC curve line */}
                    <Scatter data={rocData} line={{ stroke: "#06B6D4", strokeWidth: 2 }} lineType="joint" shape={() => <g />} legendType="none">
                      {rocData.map((_, i) => <Cell key={i} fill="transparent" />)}
                    </Scatter>
                    {/* Operating point */}
                    <Scatter data={[operatingPoint]} name="Operating Point" shape={(props: any) => {
                      const { cx, cy } = props;
                      return (
                        <g>
                          <circle cx={cx} cy={cy} r={8} fill="#F59E0B" fillOpacity={0.3} stroke="#F59E0B" strokeWidth={2} />
                          <circle cx={cx} cy={cy} r={3} fill="#F59E0B" />
                        </g>
                      );
                    }}>
                      <Cell fill="#F59E0B" />
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Live alert feed */}
            <Card className="bg-card/40 border-white/10 flex flex-col">
              <CardHeader className="pb-2 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Live Alert Feed
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">{kpi.alertsPerMin}/min</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-3">
                <div className="space-y-1.5 overflow-y-auto max-h-[208px] pr-1">
                  <AnimatePresence initial={false}>
                    {visibleAlerts.slice(0, 12).map(alert => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -12, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="group"
                      >
                        <div className={`flex items-start gap-2 px-2.5 py-2 rounded-lg border text-xs ${SEV_COLOR[alert.sev]}`}>
                          <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${SEV_DOT[alert.sev]}`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{alert.msg}</div>
                            <div className="text-[10px] opacity-60 mt-0.5 flex items-center gap-2">
                              <span>{alert.entity}</span>
                              <span>·</span>
                              <span className="font-mono">score: {alert.score}</span>
                              <span>·</span>
                              <span>{alert.ts}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => dismiss(alert.id)}
                            className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity flex-shrink-0"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {visibleAlerts.length === 0 && (
                    <div className="text-center py-8 text-xs text-muted-foreground">No active alerts</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
