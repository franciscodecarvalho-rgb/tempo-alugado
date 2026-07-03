import { createFileRoute } from "@tanstack/react-router";

import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { PropertyCard } from "@/components/property-card";

import { fetchActiveProperties, type Property } from "@/lib/api";
import heroImg from "@/assets/hero-beach-house.jpg";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      return { properties: await fetchActiveProperties(), loadError: false };
    } catch (error) {
      console.error("Failed to load active properties", error);
      return { properties: [] as Property[], loadError: true };
    }
  },
  head: () => ({
    meta: [
      { title: "Pindoramas — Aluguel de temporada com curadoria" },
      {
        name: "description",
        content:
          "Casas, villas e chalés selecionados no litoral brasileiro. Reserve direto com quem cuida do imóvel.",
      },
    ],
  }),
  component: Index,
  errorComponent: () => (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-4 py-24 text-center text-muted-foreground">
        Não foi possível carregar os imóveis agora. Tente recarregar a página.
      </div>
      <PublicFooter />
    </div>
  ),
});

function Index() {
  const { properties, loadError } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Casa à beira-mar com vista para o oceano"
            className="h-full w-full object-cover"
            width={1920}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-36">
          <div className="max-w-2xl text-primary-foreground">
            <h1 className="font-display text-6xl font-semibold leading-[1.05] md:text-7xl">
              Pindorama
            </h1>
          </div>
        </div>
      </section>

      {/* Properties */}
      <section id="imoveis" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">Imóveis em destaque</h2>
            <p className="mt-2 text-muted-foreground">Selecionados a dedo para a próxima temporada.</p>
          </div>
        </div>
        {loadError ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
            Não foi possível carregar os imóveis agora. Tente recarregar a página.
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
            Nenhum imóvel publicado ainda. Volte em breve!
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((p: Property) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>


      <PublicFooter />
    </div>
  );
}
