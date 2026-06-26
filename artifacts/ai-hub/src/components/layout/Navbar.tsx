import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Shield, Cpu, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { searchIndex } from "@/data/mockData";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/industries", label: "Industries" },
  { href: "/use-cases", label: "Use Cases" },
  { href: "/ai-explorer", label: "AI Models" },
  { href: "/platforms", label: "Platforms" },
  { href: "/compare", label: "Compare" },
  { href: "/architecture", label: "Architecture" },
  { href: "/recommend", label: "Advisor" },
  { href: "/trends", label: "Trends" },
  { href: "/about", label: "About" },
];

const typeColor: Record<string, string> = {
  Industry: "text-cyan-400",
  "Use Case": "text-amber-400",
  "AI Model": "text-purple-400",
  Platform: "text-emerald-400",
  Trend: "text-rose-400",
};

export default function Navbar() {
  const [location, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const results = query.trim().length > 1
    ? searchIndex.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleResultClick(href: string) {
    navigate(href);
    setQuery("");
    setSearchFocused(false);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Shield className="h-6 w-6 text-primary" />
          <Cpu className="h-5 w-5 text-amber-400" />
          <span className="text-lg font-bold tracking-tight text-white hidden lg:inline-block">AI Intelligence Hub</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden xl:flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location === link.href
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div ref={searchRef} className="relative hidden md:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              data-testid="global-search"
              type="text"
              placeholder="Search intelligence..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="h-9 w-52 rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:w-64 transition-all"
            />
            {/* Search dropdown */}
            {searchFocused && results.length > 0 && (
              <div className="absolute top-full mt-2 right-0 w-80 rounded-xl border border-white/10 bg-[#0d1523] shadow-2xl overflow-hidden z-50">
                {results.map((item, i) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    data-testid={`search-result-${i}`}
                    onMouseDown={() => handleResultClick(item.href)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  >
                    <span className="text-sm text-white">{item.name}</span>
                    <span className={`text-xs font-medium ${typeColor[item.type] ?? "text-muted-foreground"}`}>
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {searchFocused && query.trim().length > 1 && results.length === 0 && (
              <div className="absolute top-full mt-2 right-0 w-64 rounded-xl border border-white/10 bg-[#0d1523] shadow-xl p-4 text-sm text-muted-foreground z-50">
                No results for "{query}"
              </div>
            )}
          </div>

          <Button
            data-testid="request-demo-btn"
            variant="outline"
            size="sm"
            className="hidden sm:flex border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
            onClick={() => navigate("/recommend")}
          >
            Get Recommendation
          </Button>

          {/* Mobile menu toggle */}
          <Button
            data-testid="mobile-menu-btn"
            variant="ghost"
            size="icon"
            className="xl:hidden text-white"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-white/10 bg-background/95 backdrop-blur-md">
          {/* Mobile search */}
          <div className="px-4 pt-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {query.trim().length > 1 && results.length > 0 && (
              <div className="mt-2 rounded-xl border border-white/10 bg-[#0a1120] overflow-hidden">
                {results.map((item, i) => (
                  <button
                    key={i}
                    onMouseDown={() => handleResultClick(item.href)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 border-b border-white/5 last:border-0"
                  >
                    <span className="text-sm text-white">{item.name}</span>
                    <span className={`text-xs ${typeColor[item.type] ?? ""}`}>{item.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <nav className="px-4 pb-4 space-y-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === link.href
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
