import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Pindoramas">
          <BrandLogo className="h-10 w-auto" />
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
