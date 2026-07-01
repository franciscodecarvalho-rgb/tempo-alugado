import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Pencil, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_PROPERTIES } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/app/imoveis")({
  component: ImoveisList,
});

function ImoveisList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Imóveis</h1>
          <p className="text-muted-foreground">Gerencie seu portfólio de temporada.</p>
        </div>
        <Button asChild>
          <Link to="/app/imoveis/novo">
            <Plus className="mr-1 h-4 w-4" /> Novo imóvel
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_PROPERTIES.map((p) => (
          <Card key={p.id} className="overflow-hidden shadow-soft">
            <div className="aspect-[4/3] overflow-hidden bg-muted">
              <img src={p.coverPhoto} alt={p.title} className="h-full w-full object-cover" />
            </div>
            <CardContent className="space-y-3 p-4">
              <div>
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {p.city}, {p.state}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">R$ {p.nightlyRate.toLocaleString("pt-BR")}<span className="text-muted-foreground">/noite</span></span>
                <Button asChild size="sm" variant="outline">
                  <Link to="/app/imoveis/$id" params={{ id: p.id }}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
