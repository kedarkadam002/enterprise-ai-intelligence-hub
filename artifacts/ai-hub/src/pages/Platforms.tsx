import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { platformsData } from "@/data/mockData";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

const industryFilters = ["All", "BFSI", "Healthcare", "Energy & Utilities"];
const pricingFilters = ["All", "Enterprise", "Usage-based"];

export default function Platforms() {
  const [industryFilter, setIndustryFilter] = useState("All");
  const [pricingFilter, setPricingFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = platformsData.filter(p =>
    (industryFilter === "All" || p.industry.includes(industryFilter)) &&
    (pricingFilter === "All" || p.pricing === pricingFilter)
  );

  function toggle(id: string) {
    setExpanded(e => e === id ? null : id);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Enterprise Platforms</h1>
        <p className="text-muted-foreground mt-2">All {platformsData.length} enterprise platforms for fraud, waste & abuse detection. Click any card to expand.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Industry:</span>
          {industryFilters.map(f => (
            <button
              key={f}
              data-testid={`ind-filter-${f}`}
              onClick={() => setIndustryFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                industryFilter === f ? "bg-primary/20 border-primary text-primary" : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Pricing:</span>
          {pricingFilters.map(f => (
            <button
              key={f}
              data-testid={`price-filter-${f}`}
              onClick={() => setPricingFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                pricingFilter === f ? "bg-amber-400/20 border-amber-400 text-amber-400" : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((platform, i) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card
              className={`bg-card/40 border-white/10 transition-all cursor-pointer hover:border-primary/40 ${expanded === platform.id ? "border-primary/50" : ""}`}
              data-testid={`platform-card-${platform.id}`}
              onClick={() => toggle(platform.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground font-medium">{platform.vendor}</span>
                      <span className="text-white/20">·</span>
                      <Badge
                        variant="outline"
                        className={platform.pricing === "Usage-based" ? "text-amber-400 border-amber-400/30 bg-amber-400/10 text-xs" : "text-primary border-primary/30 bg-primary/10 text-xs"}
                      >
                        {platform.pricing}
                      </Badge>
                      {platform.realtime && (
                        <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-400/10 text-xs">
                          Real-time
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg text-white">{platform.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex flex-wrap gap-1 justify-end">
                      {platform.industry.map(ind => (
                        <span key={ind} className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/50">{ind}</span>
                      ))}
                    </div>
                    {expanded === platform.id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expanded === platform.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CardContent className="pt-0 border-t border-white/10 mt-2 space-y-5">
                    <p className="text-sm text-white/70 leading-relaxed pt-4">{platform.description}</p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Key Capabilities</div>
                        <ul className="space-y-1">
                          {platform.capabilities.map(c => (
                            <li key={c} className="flex items-center gap-2 text-sm text-white/70">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Deployment Options</div>
                        <ul className="space-y-1">
                          {platform.deployment.map(d => (
                            <li key={d} className="flex items-center gap-2 text-sm text-white/70">
                              <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4">
                          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Explainability</div>
                          <span className={`text-sm font-medium ${
                            platform.explainability === "Very High" ? "text-emerald-400" :
                            platform.explainability === "High" ? "text-cyan-400" :
                            platform.explainability === "Medium" ? "text-amber-400" : "text-rose-400"
                          }`}>{platform.explainability}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
                      {[
                        { label: "Scalability", val: platform.scalability, color: "#06B6D4" },
                        { label: "Real-time", val: platform.realtimeIndex, color: "#10B981" },
                        { label: "Explainability", val: platform.explainIndex, color: "#F59E0B" },
                        { label: "Industry Fit", val: platform.industryFit, color: "#8B5CF6" },
                        { label: "Deployment", val: platform.deployIndex, color: "#06B6D4" },
                        { label: "Cost Efficiency", val: platform.costIndex, color: "#F59E0B" },
                      ].map(m => (
                        <div key={m.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{m.label}</span>
                            <span className="font-mono text-white/70">{m.val}</span>
                          </div>
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: m.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${m.val}%` }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <XCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No platforms match the selected filters.</p>
        </div>
      )}
    </div>
  );
}
