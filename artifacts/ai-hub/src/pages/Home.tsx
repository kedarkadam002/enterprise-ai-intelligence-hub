import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { ShieldAlert, Activity, ArrowRight, ShieldCheck, Zap, Server, BarChart3, GitBranch, Brain } from "lucide-react";
import { industriesData, useCasesData } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function AnimatedCounter({ end, prefix = "", suffix = "", duration = 2 }: { end: number; prefix?: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

const features = [
  { icon: Brain, title: "Graph Neural Networks", desc: "Detect fraud rings and money laundering networks with GraphSAGE and Neo4j across 500M+ entity relationships." },
  { icon: Zap, title: "Real-time Detection", desc: "Sub-200ms transaction scoring powered by Apache Kafka ingesting 1M+ events per second across all channels." },
  { icon: BarChart3, title: "Executive Intelligence", desc: "C-suite dashboards with KPI tracking, trend analysis, and regulatory reporting across all three industries." },
  { icon: GitBranch, title: "LLM-Powered Investigation", desc: "GPT-5.5 and Claude automatically draft SAR narratives, summarize alerts, and accelerate case resolution." },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      {/* Hero */}
      <div className="grid lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Activity className="h-4 w-4" />
            <span>Enterprise Grade Fraud Intelligence</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
            Detect Anomaly.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400">
              Prevent Loss.
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            The authoritative platform for detecting Fraud, Waste & Abuse across BFSI, Healthcare, and Energy sectors. Powered by real-time Graph Analytics and Enterprise LLMs.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard">
              <Button data-testid="hero-dashboard-btn" size="lg" className="bg-primary text-black hover:bg-primary/90 h-12 px-8 font-semibold">
                Access Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/recommend">
              <Button data-testid="hero-advisor-btn" size="lg" variant="outline" className="h-12 px-8 border-white/20 text-white hover:bg-white/5">
                Get Stack Recommendation
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-8 pt-4 border-t border-white/10">
            <div>
              <div className="text-2xl font-mono font-bold text-white">
                <AnimatedCounter end={14} prefix="$" suffix="B+" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">Fraud Prevented YTD</div>
            </div>
            <div>
              <div className="text-2xl font-mono font-bold text-emerald-400">
                <AnimatedCounter end={99} suffix=".9%" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">Detection Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-mono font-bold text-cyan-400">
                <AnimatedCounter end={1200000} suffix="/s" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">Events Processed</div>
            </div>
          </div>
        </motion.div>

        {/* Right panel — stats cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Card className="bg-card/50 backdrop-blur border-white/10 col-span-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <CardContent className="p-8">
              <div className="text-sm font-medium text-muted-foreground mb-2">Total Fraud Prevented (YTD)</div>
              <div className="text-5xl font-mono font-bold text-white">$14.2B</div>
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>+24% vs Last Year</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-white/10">
            <CardContent className="p-6">
              <Zap className="h-8 w-8 text-amber-400 mb-4" />
              <div className="text-3xl font-mono font-bold text-white mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground">Detection Accuracy</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-white/10">
            <CardContent className="p-6">
              <Server className="h-8 w-8 text-primary mb-4" />
              <div className="text-3xl font-mono font-bold text-white mb-1">1.2M</div>
              <div className="text-sm text-muted-foreground">Events / Second</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Feature grid */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="py-16 border-t border-white/5"
      >
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white">Platform Capabilities</h2>
          <p className="text-muted-foreground mt-2">Enterprise-grade AI infrastructure for every fraud detection challenge.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
              >
                <Card className="bg-card/40 border-white/10 hover:border-primary/40 transition-colors h-full">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="font-semibold text-white">{feat.title}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Industry cards — clickable, link to /industries */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="py-16 border-t border-white/5"
      >
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Industry Intelligence</h2>
            <p className="text-muted-foreground mt-2">Domain-specific models and threat detection patterns.</p>
          </div>
          <Link href="/industries">
            <button className="text-sm text-primary flex items-center gap-1.5 hover:underline flex-shrink-0">
              Explore All <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {industriesData.map((ind, idx) => (
            <Link key={ind.id} href="/industries">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.08 }}
              >
                <Card
                  data-testid={`industry-card-${ind.id}`}
                  className="bg-card/40 border-white/10 hover:border-primary/50 hover:bg-card/60 transition-all cursor-pointer group"
                >
                  <CardHeader>
                    <CardTitle className="text-xl text-white group-hover:text-primary transition-colors flex items-center justify-between">
                      {ind.name}
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{ind.desc}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                        <span className="text-muted-foreground">Annual Losses</span>
                        <span className="font-mono text-rose-400">{ind.losses}</span>
                      </div>
                      <div className="flex justify-between text-sm border-b border-white/5 pb-2">
                        <span className="text-muted-foreground">AI Improvement</span>
                        <span className="font-mono text-emerald-400">{ind.improvement}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Scale</span>
                        <span className="font-mono text-white">{ind.detectionTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Featured Use Cases */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7 }}
        className="py-16 border-t border-white/5"
      >
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Use Cases</h2>
            <p className="text-muted-foreground mt-2">Ten production-grade AI implementations across all three industries.</p>
          </div>
          <Link href="/use-cases">
            <button className="text-sm text-primary flex items-center gap-1.5 hover:underline flex-shrink-0">
              View All 10 <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCasesData.slice(0, 6).map((uc, i) => (
            <Link key={uc.id} href="/use-cases">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.05 }}
              >
                <div
                  data-testid={`featured-uc-${uc.id}`}
                  className="p-5 rounded-xl border border-white/10 bg-white/5 hover:border-primary/30 hover:bg-white/8 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-white/20 text-white/50">
                      {uc.industry}
                    </Badge>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="font-semibold text-white text-sm mb-2">{uc.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{uc.overview}</div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
        className="py-16 border-t border-white/5 mb-8"
      >
        <div className="text-center max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm text-amber-400">
            <ShieldAlert className="h-4 w-4" />
            <span>AI Stack Advisor</span>
          </div>
          <h2 className="text-3xl font-bold text-white">Find Your Optimal AI Stack</h2>
          <p className="text-muted-foreground">Answer 4 questions and our recommendation engine will suggest the best open source and enterprise technology stack for your fraud detection needs.</p>
          <Link href="/recommend">
            <Button data-testid="cta-advisor-btn" size="lg" className="bg-primary text-black hover:bg-primary/90 h-12 px-10 font-semibold">
              Launch Advisor <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
