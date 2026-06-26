import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { platformsData } from "@/data/mockData";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { GitCompareArrows, Plus, X } from "lucide-react";

const COLORS = ["#06B6D4", "#F59E0B", "#8B5CF6"];

const metrics = [
  { key: "scalability", label: "Scalability" },
  { key: "realtimeIndex", label: "Real-time" },
  { key: "explainIndex", label: "Explainability" },
  { key: "industryFit", label: "Industry Fit" },
  { key: "deployIndex", label: "Deployment Ease" },
  { key: "costIndex", label: "Cost Efficiency" },
];

export default function Compare() {
  const [selected, setSelected] = useState<string[]>(["fico-falcon", "snowflake-cortex"]);
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedPlatforms = selected.map(id => platformsData.find(p => p.id === id)).filter(Boolean) as typeof platformsData;
  const available = platformsData.filter(p => !selected.includes(p.id));

  function addPlatform(id: string) {
    if (selected.length < 3) {
      setSelected(s => [...s, id]);
    }
    setShowDropdown(false);
  }

  function removePlatform(id: string) {
    setSelected(s => s.filter(x => x !== id));
  }

  const radarData = metrics.map(m => {
    const entry: Record<string, string | number> = { subject: m.label };
    selectedPlatforms.forEach((p, i) => {
      entry[`P${i}`] = (p as Record<string, unknown>)[m.key] as number;
    });
    return entry;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Technology Compare</h1>
        <p className="text-muted-foreground mt-2">Select up to 3 platforms to compare side-by-side.</p>
      </div>

      {/* Platform Selector */}
      <div className="flex flex-wrap gap-3 mb-8 items-center">
        {selectedPlatforms.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium"
            style={{ borderColor: COLORS[i] + "60", backgroundColor: COLORS[i] + "15", color: COLORS[i] }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
            {p.name}
            <button
              data-testid={`remove-${p.id}`}
              onClick={() => removePlatform(p.id)}
              className="ml-1 hover:opacity-70 transition-opacity"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {selected.length < 3 && (
          <div className="relative">
            <button
              data-testid="add-platform"
              onClick={() => setShowDropdown(s => !s)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-white/20 text-sm text-muted-foreground hover:border-white/40 hover:text-white transition-all"
            >
              <Plus className="h-4 w-4" /> Add Platform
            </button>
            {showDropdown && (
              <div className="absolute top-full mt-2 left-0 z-20 w-72 rounded-xl border border-white/10 bg-[#0d1523] shadow-2xl overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  {available.map(p => (
                    <button
                      key={p.id}
                      data-testid={`select-${p.id}`}
                      onClick={() => addPlatform(p.id)}
                      className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.industry.join(", ")}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedPlatforms.length < 2 ? (
        <div className="text-center py-20 text-muted-foreground">
          <GitCompareArrows className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Select at least 2 platforms to compare</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Radar Chart */}
          <Card className="bg-card/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base">Performance Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    {selectedPlatforms.map((p, i) => (
                      <Radar
                        key={p.id}
                        name={p.name}
                        dataKey={`P${i}`}
                        stroke={COLORS[i]}
                        fill={COLORS[i]}
                        fillOpacity={0.25}
                      />
                    ))}
                    <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0d1523", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card className="bg-card/40 border-white/10 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-white text-base">Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-6 py-3 text-muted-foreground font-medium">Attribute</th>
                      {selectedPlatforms.map((p, i) => (
                        <th key={p.id} className="px-6 py-3 text-left font-semibold" style={{ color: COLORS[i] }}>
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="px-6 py-3 text-muted-foreground">Vendor</td>
                      {selectedPlatforms.map(p => <td key={p.id} className="px-6 py-3 text-white">{p.vendor}</td>)}
                    </tr>
                    <tr className="border-b border-white/5 bg-white/2">
                      <td className="px-6 py-3 text-muted-foreground">Industry Fit</td>
                      {selectedPlatforms.map(p => (
                        <td key={p.id} className="px-6 py-3">
                          <div className="flex flex-wrap gap-1">
                            {p.industry.map(ind => (
                              <Badge key={ind} variant="outline" className="text-xs border-white/20 text-white/60">{ind}</Badge>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="px-6 py-3 text-muted-foreground">Pricing</td>
                      {selectedPlatforms.map(p => <td key={p.id} className="px-6 py-3 text-white">{p.pricing}</td>)}
                    </tr>
                    <tr className="border-b border-white/5 bg-white/2">
                      <td className="px-6 py-3 text-muted-foreground">Deployment</td>
                      {selectedPlatforms.map(p => (
                        <td key={p.id} className="px-6 py-3">
                          <div className="flex flex-wrap gap-1">
                            {p.deployment.map(d => (
                              <span key={d} className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/70">{d}</span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="px-6 py-3 text-muted-foreground">Real-time</td>
                      {selectedPlatforms.map(p => (
                        <td key={p.id} className="px-6 py-3">
                          <span className={p.realtime ? "text-emerald-400" : "text-rose-400"}>
                            {p.realtime ? "Yes" : "No"}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/5 bg-white/2">
                      <td className="px-6 py-3 text-muted-foreground">Explainability</td>
                      {selectedPlatforms.map(p => <td key={p.id} className="px-6 py-3 text-white">{p.explainability}</td>)}
                    </tr>
                    {metrics.map(m => (
                      <tr key={m.key} className="border-b border-white/5 last:border-0">
                        <td className="px-6 py-3 text-muted-foreground">{m.label} Score</td>
                        {selectedPlatforms.map((p, i) => {
                          const val = (p as Record<string, unknown>)[m.key] as number;
                          return (
                            <td key={p.id} className="px-6 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 max-w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: COLORS[i] }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${val}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                  />
                                </div>
                                <span className="text-white font-mono text-xs">{val}</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr className="border-t border-white/10 bg-white/2">
                      <td className="px-6 py-3 text-muted-foreground">Key Capabilities</td>
                      {selectedPlatforms.map(p => (
                        <td key={p.id} className="px-6 py-3">
                          <ul className="space-y-1">
                            {p.capabilities.slice(0, 3).map(c => (
                              <li key={c} className="text-xs text-white/70">• {c}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
