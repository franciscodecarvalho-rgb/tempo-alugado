import { Link } from "@tanstack/react-router";
import { Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Waves className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Coastal Stays</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/" activeOptions={{ exact: true }} className="hover:text-foreground [&.active]:text-foreground">
            Início
          </Link>
          <a href="/#imoveis" className="hover:text-foreground">Imóveis</a>
          <a href="/#contato" className="hover:text-foreground">Contato</a>
        </nav>
        <Button asChild size="sm" variant="outline">
          <Link to="/app">Área do gestor</Link>
        </Button>
      </div>
    </header>
  );
}
