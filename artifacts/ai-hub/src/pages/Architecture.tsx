import { useState } from "react";
import { motion } from "framer-motion";
import { pipelineData } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Database, BrainCircuit, Activity, ChevronDown, ChevronUp, Cpu } from "lucide-react";

const icons = [Server, Cpu, Database, Database, BrainCircuit, BrainCircuit, Activity, Activity];

export default function Architecture() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-4">
          <BrainCircuit className="h-4 w-4" />
          <span>Enterprise Reference Architecture</span>
        </div>
        <h1 className="text-3xl font-bold text-white">AI Intelligence Architecture</h1>
        <p className="text-muted-foreground mt-2">End-to-end enterprise data and AI pipeline for real-time fraud detection intelligence.</p>
      </div>

      {/* Horizontal pipeline diagram */}
      <div className="overflow-x-auto pb-6 mb-10">
        <div className="flex items-center gap-0 min-w-max mx-auto px-4">
          {pipelineData.map((step, i) => {
            const Icon = icons[i] ?? Server;
            const isExpanded = expanded === i;
            return (
              <div key={step.step} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="flex flex-col items-center"
                >
                  <button
                    data-testid={`pipeline-step-${i}`}
                    onClick={() => setExpanded(isExpanded ? null : i)}
                    className={`group flex flex-col items-center gap-2 cursor-pointer transition-all`}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all group-hover:scale-105"
                      style={{
                        backgroundColor: step.color + "15",
                        borderColor: step.color + (isExpanded ? "ff" : "60"),
                        boxShadow: isExpanded ? `0 0 20px ${step.color}40` : "none",
                      }}
                    >
                      <Icon className="h-7 w-7" style={{ color: step.color }} />
                    </div>
                    <div className="text-center w-24">
                      <div className="text-xs font-semibold text-white leading-tight">{step.step}</div>
                    </div>
                  </button>
                </motion.div>

                {i < pipelineData.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: i * 0.12 + 0.06 }}
                    className="flex items-center mx-1"
                  >
                    <div className="w-8 h-px bg-gradient-to-r from-white/20 to-white/10" />
                    <div className="w-2 h-2 border-t-2 border-r-2 border-white/20 rotate-45 -ml-1.5" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail cards */}
      <div className="space-y-3 max-w-4xl mx-auto">
        {pipelineData.map((step, i) => {
          const Icon = icons[i] ?? Server;
          const isExpanded = expanded === i;
          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                className={`border transition-all cursor-pointer hover:bg-card/60 ${
                  isExpanded ? "border-primary/40 bg-card/60" : "bg-card/40 border-white/10 hover:border-white/20"
                }`}
                onClick={() => setExpanded(isExpanded ? null : i)}
                data-testid={`arch-card-${i}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg"
                          style={{ backgroundColor: step.color + "20", color: step.color }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: step.color + "15" }}
                        >
                          <Icon className="h-5 w-5" style={{ color: step.color }} />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-white">{step.step}</div>
                        <div className="text-sm font-mono text-muted-foreground mt-0.5">{step.desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="hidden sm:flex flex-wrap gap-1.5 justify-end">
                        {step.tech.slice(0, 3).map(t => (
                          <Badge key={t} variant="outline" className="text-xs border-white/15 text-white/50 hidden md:flex">
                            {t}
                          </Badge>
                        ))}
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-5 pt-5 border-t border-white/10 space-y-4"
                    >
                      <div>
                        <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Technologies</div>
                        <div className="flex flex-wrap gap-2">
                          {step.tech.map(t => (
                            <span
                              key={t}
                              className="px-3 py-1 rounded-full text-xs font-medium border"
                              style={{ borderColor: step.color + "40", color: step.color, backgroundColor: step.color + "12" }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Role in Pipeline</div>
                          <p className="text-sm text-white/60 leading-relaxed">
                            {i === 0 && "Source systems feeding raw business events, transactions, and sensor data into the pipeline for analysis."}
                            {i === 1 && "High-throughput streaming backbone ingesting, routing, and persisting all event data with exactly-once guarantees."}
                            {i === 2 && "Petabyte-scale analytical store enabling historical batch analysis, model training, and regulatory data retention."}
                            {i === 3 && "Unified feature computation layer ensuring consistent signals between model training and real-time inference."}
                            {i === 4 && "Core ML inference layer scoring every transaction, claim, or meter reading for anomaly probability in real time."}
                            {i === 5 && "Graph database powering relationship-based fraud detection across entity networks, exposing hidden connections."}
                            {i === 6 && "Natural language interface for alert triage, SAR report generation, and compliance question answering."}
                            {i === 7 && "Final presentation layer delivering actionable intelligence to fraud analysts and executive stakeholders."}
                          </p>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Key Metric</div>
                          <p className="text-sm text-white/60 leading-relaxed">
                            {i === 0 && "4.2B transactions / day across all source systems"}
                            {i === 1 && "1M+ events / second throughput at sub-10ms latency"}
                            {i === 2 && "Petabyte-scale storage with 7-year regulatory retention"}
                            {i === 3 && "< 5ms online feature serving P99 latency"}
                            {i === 4 && "< 200ms end-to-end scoring latency per transaction"}
                            {i === 5 && "500M+ entity nodes, 2B+ relationship edges"}
                            {i === 6 && "SAR draft generation in < 30 seconds vs. hours manually"}
                            {i === 7 && "Real-time alert feed with < 1 second display latency"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
