import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trendsData } from "@/data/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Zap, AlertTriangle } from "lucide-react";

const impactColor: Record<string, string> = {
  High: "text-rose-400 border-rose-400/30 bg-rose-400/10",
  Medium: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  Low: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
};

const adoptionColor: Record<string, string> = {
  "Emerging": "text-purple-400",
  "Early Adopter": "text-blue-400",
  "Early Majority": "text-cyan-400",
  "Mainstream": "text-emerald-400",
};

const years = ["2022", "2023", "2024", "2025", "2026", "2027"];

export default function Trends() {
  const [selected, setSelected] = useState<string[]>(["1", "2", "5"]);

  const chartData = years.map((yr, i) => {
    const entry: Record<string, string | number> = { year: yr };
    trendsData.forEach(t => {
      entry[t.id] = t.growth[i] ?? 0;
    });
    return entry;
  });

  const colors = ["#06B6D4", "#F59E0B", "#8B5CF6", "#10B981", "#F43F5E", "#3B82F6", "#EC4899", "#84CC16"];

  function toggleSelected(id: string) {
    setSelected(s =>
      s.includes(id) ? s.filter(x => x !== id) : [...s, id]
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-4">
          <TrendingUp className="h-4 w-4" />
          <span>2024–2027 Outlook</span>
        </div>
        <h1 className="text-3xl font-bold text-white">AI Trends in Fraud Detection</h1>
        <p className="text-muted-foreground mt-2">Emerging technologies reshaping the future of financial crime intelligence.</p>
      </div>

      {/* Adoption Chart */}
      <Card className="bg-card/40 border-white/10 mb-8">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-white">Adoption Curve Forecast</CardTitle>
          <div className="text-xs text-muted-foreground">Click trend cards below to add/remove from chart</div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  {trendsData.map((t, i) => (
                    <linearGradient key={t.id} id={`grad-${t.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0d1523", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", fontSize: 12 }}
                  formatter={(val: number, name: string) => {
                    const trend = trendsData.find(t => t.id === name);
                    return [`${val}%`, trend?.name ?? name];
                  }}
                />
                {trendsData.filter(t => selected.includes(t.id)).map((t, i) => {
                  const colorIdx = trendsData.indexOf(t);
                  return (
                    <Area
                      key={t.id}
                      type="monotone"
                      dataKey={t.id}
                      stroke={colors[colorIdx % colors.length]}
                      fill={`url(#grad-${t.id})`}
                      strokeWidth={2}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trend Cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {trendsData.map((trend, i) => {
          const isSelected = selected.includes(trend.id);
          const color = colors[i % colors.length];
          return (
            <motion.div
              key={trend.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card
                data-testid={`trend-card-${trend.id}`}
                onClick={() => toggleSelected(trend.id)}
                className={`bg-card/40 border-white/10 cursor-pointer transition-all hover:bg-card/60 ${
                  isSelected ? "border-primary/50 ring-1 ring-primary/20" : "hover:border-white/20"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-xs ${impactColor[trend.impact] ?? ""}`}>
                          {trend.impact} Impact
                        </Badge>
                        <span className={`text-xs font-medium ${adoptionColor[trend.adoption] ?? "text-muted-foreground"}`}>
                          {trend.adoption}
                        </span>
                      </div>
                      <CardTitle className="text-base text-white">{trend.name}</CardTitle>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div
                        className={`w-3 h-3 rounded-full border-2 transition-all ${isSelected ? "border-primary bg-primary" : "border-white/20"}`}
                      />
                      <span className="text-xs text-muted-foreground">{trend.year}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <p className="text-sm text-white/60 leading-relaxed">{trend.desc}</p>
                  {/* Mini sparkline */}
                  <div className="flex items-end gap-0.5 h-8">
                    {trend.growth.map((val, gi) => (
                      <div
                        key={gi}
                        className="flex-1 rounded-sm transition-all"
                        style={{
                          height: `${(val / 100) * 100}%`,
                          backgroundColor: isSelected ? color : "rgba(255,255,255,0.1)",
                          opacity: isSelected ? 0.8 : 0.4,
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>2022</span>
                    <span className={`font-mono font-medium ${isSelected ? "" : ""}`} style={{ color: isSelected ? color : undefined }}>
                      {trend.growth[trend.growth.length - 1]}% adoption by 2027
                    </span>
                    <span>2027</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
