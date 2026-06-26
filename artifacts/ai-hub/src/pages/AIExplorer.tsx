import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { aiModelsData } from "@/data/mockData";
import { CheckCircle, XCircle, Search } from "lucide-react";

const categories = [
  { value: "all", label: "All Tools" },
  { value: "ml", label: "ML Models" },
  { value: "gnn", label: "Graph Neural Networks" },
  { value: "llm", label: "LLMs" },
  { value: "infra", label: "Data Infrastructure" },
];

const maturityColor: Record<string, string> = {
  "Production": "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  "Research/Production": "text-amber-400 border-amber-400/30 bg-amber-400/10",
  "Research": "text-rose-400 border-rose-400/30 bg-rose-400/10",
};

export default function AIExplorer() {
  const [search, setSearch] = useState("");

  function getFiltered(cat: string) {
    return aiModelsData.filter(m =>
      (cat === "all" || m.category === cat) &&
      (!search || m.name.toLowerCase().includes(search.toLowerCase()) || m.useCases.toLowerCase().includes(search.toLowerCase()))
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Explorer</h1>
          <p className="text-muted-foreground mt-2">Complete catalog of AI models and data infrastructure tools for fraud detection.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            data-testid="ai-search"
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-48"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full bg-card/40 border border-white/10 justify-start flex-wrap h-auto p-1.5 gap-1 mb-6">
          {categories.map(cat => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              data-testid={`tab-${cat.value}`}
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-muted-foreground"
            >
              {cat.label}
              <span className="ml-2 text-xs opacity-60">{getFiltered(cat.value).length}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(cat => (
          <TabsContent key={cat.value} value={cat.value} className="mt-0">
            {getFiltered(cat.value).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">No models match your search.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {getFiltered(cat.value).map((model, i) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card
                      data-testid={`model-card-${model.id}`}
                      className="bg-card/40 border-white/10 hover:border-primary/50 hover:bg-card/60 transition-all h-full group"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5">
                            {model.type}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${maturityColor[model.maturity] ?? "text-muted-foreground"}`}>
                            {model.maturity}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg text-white group-hover:text-primary transition-colors">{model.name}</CardTitle>
                        <div className="text-xs text-muted-foreground">by {model.vendor}</div>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div>
                          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">Key Use Cases</div>
                          <div className="text-white/80 text-xs leading-relaxed">{model.useCases}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs font-semibold text-emerald-400 mb-1.5 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Pros
                            </div>
                            <div className="text-xs text-white/70 leading-relaxed">{model.pros}</div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-rose-400 mb-1.5 flex items-center gap-1">
                              <XCircle className="h-3 w-3" /> Cons
                            </div>
                            <div className="text-xs text-white/70 leading-relaxed">{model.cons}</div>
                          </div>
                        </div>
                        <div className="pt-1 border-t border-white/5 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">License</span>
                          <span className="text-xs font-mono text-white/60">{model.license}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
