import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { industriesData, useCasesData, platformsData } from "@/data/mockData";
import { Link } from "wouter";
import { ArrowRight, TrendingUp } from "lucide-react";

const industryNameToId: Record<string, string> = {
  "BFSI": "bfsi",
  "Healthcare": "healthcare",
  "Energy & Utilities": "energy",
};

export default function Industries() {
  const [activeIndustry, setActiveIndustry] = useState("bfsi");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Industry Explorer</h1>
        <p className="text-muted-foreground mt-2">Domain-specific AI models, threat patterns, and platform recommendations.</p>
      </div>

      <Tabs defaultValue="bfsi" onValueChange={setActiveIndustry} className="w-full">
        <TabsList className="w-full bg-card/40 border border-white/10 justify-start mb-6 p-1.5 gap-1">
          <TabsTrigger value="bfsi" data-testid="tab-bfsi" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            BFSI
          </TabsTrigger>
          <TabsTrigger value="healthcare" data-testid="tab-healthcare" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Healthcare
          </TabsTrigger>
          <TabsTrigger value="energy" data-testid="tab-energy" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Energy & Utilities
          </TabsTrigger>
        </TabsList>

        {industriesData.map((ind) => {
          const relatedUseCases = useCasesData.filter(u => industryNameToId[u.industry] === ind.id);
          const relatedPlatforms = platformsData.filter(p => p.industry.includes(ind.name));

          return (
            <TabsContent key={ind.id} value={ind.id} className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Overview + Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="bg-card/40 border-white/10 md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        {ind.name} Industry Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-white/70 leading-relaxed">{ind.overview}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {ind.stats.map(stat => (
                          <div key={stat.label} className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                            <div className="text-xl font-mono font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-xs text-muted-foreground leading-tight">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/40 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Key Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Annual Financial Impact</div>
                        <div className="text-2xl font-mono text-white">{ind.losses}</div>
                        <div className="text-xs text-rose-400">in fraud, waste & abuse</div>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">AI Detection Improvement</div>
                        <div className="text-2xl font-mono text-emerald-400">{ind.improvement}</div>
                        <div className="text-xs text-white/50">vs. traditional methods</div>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Scale</div>
                        <div className="text-lg font-mono text-cyan-400">{ind.detectionTime}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Use Cases */}
                <Card className="bg-card/40 border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white text-base">Use Cases in {ind.name}</CardTitle>
                    <Link href="/use-cases">
                      <button className="text-xs text-primary flex items-center gap-1 hover:underline">
                        View All <ArrowRight className="h-3 w-3" />
                      </button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {relatedUseCases.map(uc => (
                        <div
                          key={uc.id}
                          data-testid={`industry-uc-${uc.id}`}
                          className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-primary/30 transition-colors"
                        >
                          <div className="font-semibold text-white text-sm mb-1">{uc.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2 mb-3">{uc.overview}</div>
                          <div className="text-xs font-mono text-cyan-400 truncate">{uc.osStack}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Platforms */}
                <Card className="bg-card/40 border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white text-base">Relevant Enterprise Platforms</CardTitle>
                    <Link href="/platforms">
                      <button className="text-xs text-primary flex items-center gap-1 hover:underline">
                        Compare All <ArrowRight className="h-3 w-3" />
                      </button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {relatedPlatforms.map(p => (
                        <Badge
                          key={p.id}
                          variant="outline"
                          className="border-white/20 text-white/70 hover:border-primary/40 hover:text-primary transition-colors cursor-default"
                        >
                          {p.name}
                          <span className="ml-2 text-xs opacity-60">{p.pricing}</span>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
