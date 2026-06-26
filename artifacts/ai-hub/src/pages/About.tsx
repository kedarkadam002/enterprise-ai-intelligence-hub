import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
      <h1 className="text-4xl font-bold text-white mb-6">AI Intelligence Hub</h1>
      <p className="text-xl text-muted-foreground mb-12">
        The authoritative platform for enterprise fraud intelligence, bridging the gap between open-source innovation and enterprise reliability.
      </p>

      <div className="grid md:grid-cols-3 gap-6 text-left">
        <Card className="bg-card/40 border-white/10">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-primary mb-2">3</div>
            <div className="text-sm text-muted-foreground">Core Industries Served</div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 border-white/10">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-emerald-400 mb-2">10+</div>
            <div className="text-sm text-muted-foreground">Enterprise Use Cases</div>
          </CardContent>
        </Card>
        <Card className="bg-card/40 border-white/10">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-secondary mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Static Intelligence</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
