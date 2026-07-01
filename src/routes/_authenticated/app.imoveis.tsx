import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil, MapPin, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchAllProperties } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/app/imoveis")({
  component: ImoveisList,
});

function ImoveisList() {
  const { data: properties, isLoading, isError } = useQuery({
    queryKey: ["properties"],
    queryFn: fetchAllProperties,
  });

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

      {isLoading && <p className="text-sm text-muted-foreground">Carregando imóveis...</p>}
      {isError && <p className="text-sm text-destructive">Erro ao carregar imóveis.</p>}

      {properties && properties.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
          Você ainda não cadastrou nenhum imóvel.{" "}
          <Link to="/app/imoveis/novo" className="text-primary underline">
            Cadastre o primeiro
          </Link>
          .
        </div>
      )}

      {properties && properties.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <Card key={p.id} className="overflow-hidden shadow-soft">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                {p.coverPhoto ? (
                  <img src={p.coverPhoto} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageOff className="h-8 w-8" />
                  </div>
                )}
              </div>
              <CardContent className="space-y-3 p-4">
                <div>
                  <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {p.city}, {p.state}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    R$ {p.nightlyRate.toLocaleString("pt-BR")}
                    <span className="text-muted-foreground">/noite</span>
                  </span>
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
      )}
    </div>
  );
}
