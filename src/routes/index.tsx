import { createFileRoute } from "@tanstack/react-router";

import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
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
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-background/20 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Curadoria de temporada
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] md:text-6xl">
              O mar te espera. <br />
              <span className="italic">Nós cuidamos do resto.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-primary-foreground/90 md:text-lg">
              Casas e villas selecionadas em Jericoacoara, Búzios, Praia do Rosa e outros destinos favoritos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <a href="#imoveis">Ver imóveis <ArrowRight className="ml-1 h-4 w-4" /></a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Reserva segura", desc: "Verificamos cada imóvel pessoalmente." },
            { icon: Sparkles, title: "Curadoria real", desc: "Só casas que a gente indicaria pra família." },
            { icon: HeadphonesIcon, title: "Suporte 24/7", desc: "Estamos com você durante toda a estadia." },
          ].map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <p.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-3 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Properties */}
      <section id="imoveis" className="mx-auto max-w-6xl px-4 py-8">
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

      {/* CTA gestor */}
      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="overflow-hidden rounded-3xl bg-gradient-hero p-10 text-primary-foreground shadow-warm md:p-14">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              É proprietário ou gestor?
            </h2>
            <p className="mt-3 text-primary-foreground/90">
              Cadastre seu imóvel e gerencie reservas, calendário e tarefas em um só lugar.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-6">
              <Link to="/auth">Acessar o painel</Link>
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
