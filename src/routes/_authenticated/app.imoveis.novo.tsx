import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ArrowLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProperty } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/app/imoveis/novo")({
  component: NovoImovel,
});

type PickedPhoto = { url: string; file: File };

function NovoImovel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  const onPickPhotos = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files)
      .slice(0, 12 - photos.length)
      .map((f) => ({ url: URL.createObjectURL(f), file: f }));
    setPhotos((prev) => [...prev, ...next]);
  };

  const num = (form: HTMLFormElement, id: string) => Number((form.elements.namedItem(id) as HTMLInputElement)?.value || 0);
  const str = (form: HTMLFormElement, id: string) => (form.elements.namedItem(id) as HTMLInputElement)?.value.trim() ?? "";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSaving(true);
    try {
      await createProperty(
        {
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
        },
        photos.map((p) => p.file),
      );
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast.success("Imóvel cadastrado!");
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
        <h1 className="font-display text-3xl font-semibold">Novo imóvel</h1>
        <p className="text-muted-foreground">Cadastre um imóvel do seu portfólio.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card className="shadow-soft">
          <CardHeader><CardTitle>Informações básicas</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required placeholder="Casa Vista Mar" />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" name="city" required placeholder="Jericoacoara" />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input id="state" name="state" required maxLength={2} placeholder="CE" />
            </div>
            <div>
              <Label htmlFor="bedrooms">Quartos</Label>
              <Input id="bedrooms" name="bedrooms" type="number" min={0} defaultValue={2} />
            </div>
            <div>
              <Label htmlFor="bathrooms">Banheiros</Label>
              <Input id="bathrooms" name="bathrooms" type="number" min={0} defaultValue={1} />
            </div>
            <div>
              <Label htmlFor="guests">Hóspedes máx.</Label>
              <Input id="guests" name="guests" type="number" min={1} defaultValue={4} />
            </div>
            <div>
              <Label htmlFor="rate">Diária (R$)</Label>
              <Input id="rate" name="rate" type="number" min={0} defaultValue={500} />
            </div>
            <div>
              <Label htmlFor="cleaning">Taxa de limpeza (R$)</Label>
              <Input id="cleaning" name="cleaning" type="number" min={0} defaultValue={0} />
            </div>
            <div>
              <Label htmlFor="laundry">Lavanderia (R$)</Label>
              <Input id="laundry" name="laundry" type="number" min={0} defaultValue={0} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="desc">Descrição</Label>
              <Textarea id="desc" name="desc" rows={4} placeholder="Conte o que torna este imóvel especial." />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader><CardTitle>Fotos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div
              onClick={() => inputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/40 p-8 text-center transition-colors hover:bg-muted"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium">Clique para adicionar fotos</p>
              <p className="text-xs text-muted-foreground">JPG ou PNG, até 12 fotos</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onPickPhotos(e.target.files)}
              />
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photos.map((p, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                    <img src={p.url} alt={p.file.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                      className="absolute right-1 top-1 rounded-full bg-background/90 p-1 opacity-0 shadow-soft transition group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button asChild variant="outline">
            <Link to="/app/imoveis">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar imóvel"}
          </Button>
        </div>
      </form>
    </div>
  );
}
