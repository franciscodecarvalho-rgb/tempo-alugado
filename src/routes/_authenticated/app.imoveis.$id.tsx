import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchPropertyById, updateProperty } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/app/imoveis/$id")({
  loader: async ({ params }) => {
    const property = await fetchPropertyById(params.id);
    if (!property) throw notFound();
    return { property };
  },
  component: EditImovel,
  notFoundComponent: () => <div className="p-8 text-center text-muted-foreground">Imóvel não encontrado.</div>,
  errorComponent: () => <div className="p-8 text-center text-muted-foreground">Erro ao carregar.</div>,
});

function EditImovel() {
  const { property } = Route.useLoaderData();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const num = (form: HTMLFormElement, id: string) => Number((form.elements.namedItem(id) as HTMLInputElement)?.value || 0);
  const str = (form: HTMLFormElement, id: string) => (form.elements.namedItem(id) as HTMLInputElement)?.value.trim() ?? "";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSaving(true);
    try {
      await updateProperty(property.id, {
        title: str(form, "title"),
        city: str(form, "city"),
        state: str(form, "state"),
        bedrooms: num(form, "bedrooms"),
        bathrooms: num(form, "bathrooms"),
        maxGuests: num(form, "guests"),
        nightlyRate: num(form, "rate"),
        cleaningFee: num(form, "cleaning"),
        laundryFee: num(form, "laundry"),
        description: str(form, "desc"),
      });
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Alterações salvas!");
      navigate({ to: "/app/imoveis" });
    } catch (err) {
      toast.error("Não foi possível salvar", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link to="/app/imoveis"><ArrowLeft className="mr-1 h-4 w-4" /> Voltar</Link>
        </Button>
        <h1 className="font-display text-3xl font-semibold">Editar imóvel</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card className="shadow-soft">
          <CardHeader><CardTitle>{property.title}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required defaultValue={property.title} />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" name="city" defaultValue={property.city} />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input id="state" name="state" maxLength={2} defaultValue={property.state} />
            </div>
            <div>
              <Label htmlFor="bedrooms">Quartos</Label>
              <Input id="bedrooms" name="bedrooms" type="number" min={0} defaultValue={property.bedrooms} />
            </div>
            <div>
              <Label htmlFor="bathrooms">Banheiros</Label>
              <Input id="bathrooms" name="bathrooms" type="number" min={0} defaultValue={property.bathrooms} />
            </div>
            <div>
              <Label htmlFor="guests">Hóspedes máx.</Label>
              <Input id="guests" name="guests" type="number" min={1} defaultValue={property.maxGuests} />
            </div>
            <div>
              <Label htmlFor="rate">Diária (R$)</Label>
              <Input id="rate" name="rate" type="number" min={0} defaultValue={property.nightlyRate} />
            </div>
            <div>
              <Label htmlFor="cleaning">Taxa de limpeza (R$)</Label>
              <Input id="cleaning" name="cleaning" type="number" min={0} defaultValue={property.cleaningFee} />
            </div>
            <div>
              <Label htmlFor="laundry">Lavanderia (R$)</Label>
              <Input id="laundry" name="laundry" type="number" min={0} defaultValue={property.laundryFee} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="desc">Descrição</Label>
              <Textarea id="desc" name="desc" rows={4} defaultValue={property.description} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button asChild variant="outline"><Link to="/app/imoveis">Cancelar</Link></Button>
          <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button>
        </div>
      </form>
    </div>
  );
}
