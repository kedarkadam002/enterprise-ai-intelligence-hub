import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Industries from "@/pages/Industries";
import UseCases from "@/pages/UseCases";
import AIExplorer from "@/pages/AIExplorer";
import Platforms from "@/pages/Platforms";
import Compare from "@/pages/Compare";
import Architecture from "@/pages/Architecture";
import Recommend from "@/pages/Recommend";
import Trends from "@/pages/Trends";
import About from "@/pages/About";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/industries" component={Industries} />
        <Route path="/use-cases" component={UseCases} />
        <Route path="/ai-explorer" component={AIExplorer} />
        <Route path="/platforms" component={Platforms} />
        <Route path="/compare" component={Compare} />
        <Route path="/architecture" component={Architecture} />
        <Route path="/recommend" component={Recommend} />
        <Route path="/trends" component={Trends} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
