import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_PROPERTIES } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/app/imoveis/$id")({
  loader: ({ params }) => {
    const property = MOCK_PROPERTIES.find((p) => p.id === params.id);
    if (!property) throw notFound();
    return { property };
  },
  component: EditImovel,
  notFoundComponent: () => <div className="p-8 text-center text-muted-foreground">Imóvel não encontrado.</div>,
  errorComponent: () => <div className="p-8 text-center text-muted-foreground">Erro ao carregar.</div>,
});

function EditImovel() {
  const { property } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link to="/app/imoveis"><ArrowLeft className="mr-1 h-4 w-4" /> Voltar</Link>
        </Button>
        <h1 className="font-display text-3xl font-semibold">Editar imóvel</h1>
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle>{property.title}</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Título</Label>
            <Input defaultValue={property.title} />
          </div>
          <div>
            <Label>Cidade</Label>
            <Input defaultValue={property.city} />
          </div>
          <div>
            <Label>Estado</Label>
            <Input defaultValue={property.state} />
          </div>
          <div>
            <Label>Diária</Label>
            <Input type="number" defaultValue={property.nightlyRate} />
          </div>
          <div>
            <Label>Hóspedes máx.</Label>
            <Input type="number" defaultValue={property.maxGuests} />
          </div>
          <div className="sm:col-span-2">
            <Label>Descrição</Label>
            <Textarea rows={4} defaultValue={property.description} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button asChild variant="outline"><Link to="/app/imoveis">Cancelar</Link></Button>
        <Button>Salvar alterações</Button>
      </div>
    </div>
  );
}
