import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCasesData } from "@/data/mockData";
import { ChevronRight, ChevronLeft, CheckCircle, Code2, Building2, Zap, Eye, Cloud, DollarSign, Sparkles } from "lucide-react";

const industries = ["BFSI", "Healthcare", "Energy & Utilities"];
const clouds = ["AWS", "Azure", "GCP", "On-premise", "Multi-cloud"];
const budgets = [
  { label: "POC / Pilot", desc: "Under $50K", value: "poc" },
  { label: "Mid-Market", desc: "$50K – $500K", value: "mid" },
  { label: "Enterprise", desc: "$500K+", value: "enterprise" },
];

type Form = {
  industry: string;
  useCase: string;
  budget: string;
  cloud: string;
  realtime: boolean;
  explainability: boolean;
};

const emptyForm: Form = {
  industry: "",
  useCase: "",
  budget: "",
  cloud: "",
  realtime: false,
  explainability: false,
};

function generateRecommendation(form: Form) {
  const uc = useCasesData.find(u => u.id === form.useCase || u.name === form.useCase);
  const isEnterprise = form.budget === "enterprise";
  const needsRealtime = form.realtime;
  const needsExplain = form.explainability;

  const osStack = uc?.osStack ?? "XGBoost + Kafka + Feast";
  const osRationale = uc
    ? `${uc.osRationale}${needsRealtime ? " Real-time processing via Kafka is included in this stack." : ""}${needsExplain ? " SHAP values from XGBoost/LightGBM ensure regulatory-grade explainability." : ""}`
    : "General-purpose fraud detection stack with high throughput and interpretability.";

  const enterpriseStack = uc?.enterpriseStack ?? "Databricks + Snowflake Cortex AI";
  const enterpriseRationale = uc
    ? `${uc.enterpriseRationale}${form.cloud !== "On-premise" ? ` Deployable on ${form.cloud} for cloud-native scalability.` : " On-premise deployment supported for data sovereignty requirements."}${needsExplain ? " Built-in explainability tools satisfy regulatory audit requirements." : ""}`
    : "Enterprise-grade platform with managed services, compliance tooling, and dedicated support SLAs.";

  const justification = `Based on your requirements — ${form.industry} industry, ${form.useCase || "fraud detection"} use case, ${budgets.find(b => b.value === form.budget)?.label ?? "enterprise"} budget, ${form.cloud} deployment${needsRealtime ? ", real-time processing" : ""}${needsExplain ? ", explainability" : ""} — we recommend a dual-track approach. ${isEnterprise ? "The enterprise stack provides proven accuracy, dedicated support, and compliance coverage critical at your scale." : "The open source stack maximizes cost efficiency while delivering production-grade performance."} ${needsRealtime ? "Real-time streaming components are central to this architecture, enabling sub-200ms detection latency." : "Batch processing architecture reduces infrastructure cost while maintaining detection accuracy."} ${needsExplain ? "Explainability is built into every layer, from SHAP values at inference time to audit-ready model cards, satisfying regulatory scrutiny." : ""}`;

  return { osStack, osRationale, enterpriseStack, enterpriseRationale, justification };
}

export default function Recommend() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [recommendation, setRecommendation] = useState<ReturnType<typeof generateRecommendation> | null>(null);

  const filteredUseCases = useCasesData.filter(u =>
    !form.industry || u.industry === form.industry
  );

  const steps = [
    { label: "Industry", icon: Building2 },
    { label: "Use Case", icon: Zap },
    { label: "Budget & Cloud", icon: DollarSign },
    { label: "Requirements", icon: Eye },
  ];

  function handleNext() {
    if (step < steps.length - 1) setStep(s => s + 1);
    else {
      const rec = generateRecommendation(form);
      setRecommendation(rec);
      setSubmitted(true);
    }
  }

  function handleReset() {
    setForm(emptyForm);
    setStep(0);
    setSubmitted(false);
    setRecommendation(null);
  }

  const canNext = () => {
    if (step === 0) return !!form.industry;
    if (step === 1) return !!form.useCase;
    if (step === 2) return !!form.budget && !!form.cloud;
    return true;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Stack Advisor</span>
        </div>
        <h1 className="text-3xl font-bold text-white">AI Recommendation Engine</h1>
        <p className="text-muted-foreground mt-2">Answer 4 questions to get your optimal intelligence stack.</p>
      </div>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-2 flex-1">
                    <div className={`flex items-center gap-2 ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                        i < step ? "bg-primary text-black border-primary" :
                        i === step ? "border-primary text-primary" : "border-white/10 text-muted-foreground"
                      }`}>
                        {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className="text-xs hidden sm:block">{s.label}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`h-px flex-1 transition-all ${i < step ? "bg-primary" : "bg-white/10"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            <Card className="bg-card/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {(() => { const Icon = steps[step].icon; return <Icon className="h-5 w-5 text-primary" />; })()}
                  Step {step + 1}: {steps[step].label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                      <p className="text-sm text-muted-foreground">Which industry are you in?</p>
                      {industries.map(ind => (
                        <button
                          key={ind}
                          data-testid={`industry-${ind}`}
                          onClick={() => { setForm(f => ({ ...f, industry: ind, useCase: "" })); }}
                          className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                            form.industry === ind
                              ? "bg-primary/20 border-primary text-primary"
                              : "bg-white/5 border-white/10 text-white hover:border-white/30"
                          }`}
                        >
                          <div className="font-medium">{ind}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {ind === "BFSI" && "Banking, Financial Services, Insurance"}
                            {ind === "Healthcare" && "Payers, Providers, Managed Care"}
                            {ind === "Energy & Utilities" && "Electric, Gas, Water Utilities"}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                      <p className="text-sm text-muted-foreground">Select your primary use case:</p>
                      <div className="grid gap-2 max-h-80 overflow-y-auto pr-1">
                        {filteredUseCases.map(uc => (
                          <button
                            key={uc.id}
                            data-testid={`usecase-${uc.id}`}
                            onClick={() => setForm(f => ({ ...f, useCase: uc.id }))}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                              form.useCase === uc.id
                                ? "bg-primary/20 border-primary text-primary"
                                : "bg-white/5 border-white/10 text-white hover:border-white/30"
                            }`}
                          >
                            <div className="font-medium text-sm">{uc.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 truncate">{uc.overview}</div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-3">Budget range:</p>
                        <div className="grid gap-3">
                          {budgets.map(b => (
                            <button
                              key={b.value}
                              data-testid={`budget-${b.value}`}
                              onClick={() => setForm(f => ({ ...f, budget: b.value }))}
                              className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${
                                form.budget === b.value
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-white/5 border-white/10 text-white hover:border-white/30"
                              }`}
                            >
                              <div className="font-medium">{b.label}</div>
                              <div className="text-xs text-muted-foreground">{b.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-3">Preferred cloud / deployment:</p>
                        <div className="flex flex-wrap gap-2">
                          {clouds.map(c => (
                            <button
                              key={c}
                              data-testid={`cloud-${c}`}
                              onClick={() => setForm(f => ({ ...f, cloud: c }))}
                              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                                form.cloud === c
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-white"
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <p className="text-sm text-muted-foreground">Select all that apply:</p>
                      <div className="space-y-3">
                        <button
                          data-testid="toggle-realtime"
                          onClick={() => setForm(f => ({ ...f, realtime: !f.realtime }))}
                          className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center justify-between ${
                            form.realtime ? "bg-primary/20 border-primary" : "bg-white/5 border-white/10 hover:border-white/30"
                          }`}
                        >
                          <div>
                            <div className={`font-medium ${form.realtime ? "text-primary" : "text-white"}`}>Real-time Detection Required</div>
                            <div className="text-xs text-muted-foreground mt-1">Sub-500ms decision latency for live transaction scoring</div>
                          </div>
                          <div className={`w-10 h-6 rounded-full transition-all flex items-center px-1 ${form.realtime ? "bg-primary" : "bg-white/10"}`}>
                            <div className={`w-4 h-4 rounded-full bg-white transition-all ${form.realtime ? "ml-4" : "ml-0"}`} />
                          </div>
                        </button>
                        <button
                          data-testid="toggle-explainability"
                          onClick={() => setForm(f => ({ ...f, explainability: !f.explainability }))}
                          className={`w-full text-left px-5 py-4 rounded-xl border transition-all flex items-center justify-between ${
                            form.explainability ? "bg-primary/20 border-primary" : "bg-white/5 border-white/10 hover:border-white/30"
                          }`}
                        >
                          <div>
                            <div className={`font-medium ${form.explainability ? "text-primary" : "text-white"}`}>Explainability Required</div>
                            <div className="text-xs text-muted-foreground mt-1">Regulatory or compliance mandate for model decision explanations</div>
                          </div>
                          <div className={`w-10 h-6 rounded-full transition-all flex items-center px-1 ${form.explainability ? "bg-primary" : "bg-white/10"}`}>
                            <div className={`w-4 h-4 rounded-full bg-white transition-all ${form.explainability ? "ml-4" : "ml-0"}`} />
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3 pt-4">
                  {step > 0 && (
                    <Button variant="outline" onClick={() => setStep(s => s - 1)} className="border-white/10 text-white hover:bg-white/5">
                      <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                  )}
                  <Button
                    data-testid="next-btn"
                    onClick={handleNext}
                    disabled={!canNext()}
                    className="flex-1 bg-primary text-black hover:bg-primary/90 disabled:opacity-40"
                  >
                    {step === steps.length - 1 ? (
                      <><Sparkles className="h-4 w-4 mr-2" /> Generate Recommendation</>
                    ) : (
                      <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-sm text-emerald-400 mb-3">
                <CheckCircle className="h-4 w-4" />
                <span>Recommendation Generated</span>
              </div>
              <h2 className="text-xl font-bold text-white">Your Optimal AI Stack</h2>
              <div className="flex justify-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-primary border-primary/30">{form.industry}</Badge>
                {form.useCase && <Badge variant="outline" className="border-white/20 text-white/60">{useCasesData.find(u => u.id === form.useCase)?.name}</Badge>}
                <Badge variant="outline" className="border-white/20 text-white/60">{form.cloud}</Badge>
                {form.realtime && <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">Real-time</Badge>}
                {form.explainability && <Badge variant="outline" className="text-amber-400 border-amber-400/30">Explainable AI</Badge>}
              </div>
            </div>

            <Card className="bg-cyan-400/5 border-cyan-400/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-cyan-400 flex items-center gap-2 text-lg">
                  <Code2 className="h-5 w-5" /> Recommended Open Source Stack
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xl font-mono text-white">{recommendation?.osStack}</div>
                <p className="text-sm text-white/60 leading-relaxed">{recommendation?.osRationale}</p>
              </CardContent>
            </Card>

            <Card className="bg-amber-400/5 border-amber-400/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-400 flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5" /> Recommended Enterprise Stack
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xl font-mono text-white">{recommendation?.enterpriseStack}</div>
                <p className="text-sm text-white/60 leading-relaxed">{recommendation?.enterpriseRationale}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" /> Business Justification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70 leading-relaxed">{recommendation?.justification}</p>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                data-testid="reset-btn"
                onClick={handleReset}
                variant="outline"
                className="flex-1 border-white/10 text-white hover:bg-white/5"
              >
                Start Over
              </Button>
              <Button
                data-testid="export-btn"
                className="flex-1 bg-primary text-black hover:bg-primary/90"
                onClick={() => {
                  const text = `AI Recommendation Report\n\nIndustry: ${form.industry}\nUse Case: ${useCasesData.find(u => u.id === form.useCase)?.name ?? form.useCase}\nCloud: ${form.cloud}\nReal-time: ${form.realtime ? "Yes" : "No"}\nExplainability: ${form.explainability ? "Yes" : "No"}\n\nOpen Source Stack: ${recommendation?.osStack}\n${recommendation?.osRationale}\n\nEnterprise Stack: ${recommendation?.enterpriseStack}\n${recommendation?.enterpriseRationale}\n\nBusiness Justification:\n${recommendation?.justification}`;
                  const blob = new Blob([text], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = "ai-recommendation.txt"; a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export Report
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
