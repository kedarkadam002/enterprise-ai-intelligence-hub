import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCasesData } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertTriangle, Layers, BarChart3, ChevronRight, Building2, Code2 } from "lucide-react";

const industryColor: Record<string, string> = {
  BFSI: "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  Healthcare: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  "Energy & Utilities": "text-amber-400 border-amber-400/30 bg-amber-400/10",
};

export default function UseCases() {
  const [selected, setSelected] = useState<typeof useCasesData[0] | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "stacks" | "architecture" | "benefits">("overview");
  const [filter, setFilter] = useState<string>("All");

  const industries = ["All", "BFSI", "Healthcare", "Energy & Utilities"];
  const filtered = filter === "All" ? useCasesData : useCasesData.filter(u => u.industry === filter);

  function openDetail(uc: typeof useCasesData[0]) {
    setSelected(uc);
    setActiveTab("overview");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Business Use Cases</h1>
        <p className="text-muted-foreground mt-2">Comprehensive catalog of AI/ML applications in fraud detection. Click any card for full details.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {industries.map(ind => (
          <button
            key={ind}
            data-testid={`filter-${ind}`}
            onClick={() => setFilter(ind)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              filter === ind
                ? "bg-primary/20 border-primary text-primary"
                : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-white"
            }`}
          >
            {ind}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((useCase, i) => (
          <motion.div
            key={useCase.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              data-testid={`use-case-card-${useCase.id}`}
              onClick={() => openDetail(useCase)}
              className="bg-card/40 border-white/10 h-full flex flex-col hover:border-primary/50 hover:bg-card/60 transition-all cursor-pointer group"
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={`uppercase text-[10px] tracking-wider ${industryColor[useCase.industry] ?? "text-primary border-primary/30"}`}>
                    {useCase.industry}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="text-xl text-white group-hover:text-primary transition-colors">{useCase.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-3">{useCase.overview}</p>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-white/50 mb-1 uppercase tracking-wider flex items-center gap-1">
                      <Code2 className="h-3 w-3" /> Open Source Stack
                    </div>
                    <div className="text-sm font-mono text-cyan-400 truncate">{useCase.osStack}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white/50 mb-1 uppercase tracking-wider flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> Enterprise Stack
                    </div>
                    <div className="text-sm font-mono text-amber-400 truncate">{useCase.enterpriseStack}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/10 bg-[#0d1523] shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 bg-[#0d1523]/95 backdrop-blur border-b border-white/10 p-6 flex items-start justify-between">
                <div>
                  <Badge variant="outline" className={`mb-2 uppercase text-[10px] tracking-wider ${industryColor[selected.industry] ?? ""}`}>
                    {selected.industry}
                  </Badge>
                  <h2 className="text-2xl font-bold text-white">{selected.name}</h2>
                </div>
                <button
                  data-testid="close-modal"
                  onClick={() => setSelected(null)}
                  className="text-muted-foreground hover:text-white transition-colors ml-4 mt-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-4 border-b border-white/10 overflow-x-auto">
                {(["overview", "stacks", "architecture", "benefits"] as const).map(tab => (
                  <button
                    key={tab}
                    data-testid={`tab-${tab}`}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize whitespace-nowrap transition-all ${
                      activeTab === tab ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    {tab === "stacks" ? "Tech Stacks" : tab === "benefits" ? "Business Benefits" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6 space-y-6">
                {activeTab === "overview" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Overview</h3>
                      <p className="text-white/80 leading-relaxed">{selected.overview}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-400" /> Key Challenges
                      </h3>
                      <ul className="space-y-2">
                        {selected.challenges.map((c, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Code2 className="h-4 w-4 text-cyan-400" /> Open Source Options
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selected.openSourceOptions.map(o => (
                          <span key={o} className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">{o}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "stacks" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="p-5 rounded-xl bg-cyan-400/5 border border-cyan-400/20">
                      <h3 className="text-lg font-semibold text-cyan-400 mb-1 flex items-center gap-2">
                        <Code2 className="h-5 w-5" /> Recommended Open Source Stack
                      </h3>
                      <div className="text-xl font-mono text-white mb-3">{selected.osStack}</div>
                      <p className="text-sm text-white/60">{selected.osRationale}</p>
                    </div>
                    <div className="p-5 rounded-xl bg-amber-400/5 border border-amber-400/20">
                      <h3 className="text-lg font-semibold text-amber-400 mb-1 flex items-center gap-2">
                        <Building2 className="h-5 w-5" /> Recommended Enterprise Stack
                      </h3>
                      <div className="text-xl font-mono text-white mb-3">{selected.enterpriseStack}</div>
                      <p className="text-sm text-white/60">{selected.enterpriseRationale}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Enterprise Platforms Available</h3>
                      <div className="flex flex-wrap gap-2">
                        {selected.enterprisePlatforms.map(p => (
                          <span key={p} className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white border border-white/10">{p}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "architecture" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" /> Architecture Pipeline
                    </h3>
                    <div className="space-y-2">
                      {selected.architecture.split(" → ").map((step, i, arr) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-0">
                            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                              {i + 1}
                            </div>
                            {i < arr.length - 1 && <div className="w-px h-6 bg-primary/20" />}
                          </div>
                          <div className="pb-1">
                            <div className="text-sm text-white font-medium mt-1">{step}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "benefits" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-emerald-400" /> Business Benefits
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selected.benefits.map((b, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="text-2xl font-bold text-emerald-400 mb-1 font-mono">{b.value}</div>
                          <div className="text-xs text-white/50 uppercase tracking-wider">{b.metric}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        Results based on enterprise implementations. Actual outcomes vary by organization size, data quality, and implementation scope.
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="px-6 pb-6">
                <Button
                  data-testid="close-modal-btn"
                  onClick={() => setSelected(null)}
                  variant="outline"
                  className="w-full border-white/10 text-white hover:bg-white/5"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
