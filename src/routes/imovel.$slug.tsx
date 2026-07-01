import { createFileRoute, notFound } from "@tanstack/react-router";
import { BedDouble, Bath, Users, MapPin, Check } from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { PublicFooter } from "@/components/public-footer";
import { BookingRequestForm } from "@/components/booking-request-form";
import { Calendar } from "@/components/ui/calendar";
import { fetchPropertyBySlug, fetchUnavailableRanges } from "@/lib/api";

export const Route = createFileRoute("/imovel/$slug")({
  loader: async ({ params }) => {
    const property = await fetchPropertyBySlug(params.slug);
    if (!property) throw notFound();
    const booked = await fetchUnavailableRanges(property.id);
    return { property, booked };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.property.title} — Coastal Stays` },
          { name: "description", content: (loaderData.property.description || "").slice(0, 155) },
          { property: "og:title", content: `${loaderData.property.title} — Coastal Stays` },
          { property: "og:description", content: (loaderData.property.description || "").slice(0, 155) },
        ]
      : [],
  }),
  component: PropertyPage,
  errorComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">Não foi possível carregar este imóvel.</div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Imóvel não encontrado</h1>
        <p className="mt-2 text-muted-foreground">O link pode estar expirado ou o imóvel foi retirado.</p>
      </div>
    </div>
  ),
});

function PropertyPage() {
  const { property, booked } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Gallery */}
        {property.photos.length > 0 ? (
          <div className="grid gap-2 overflow-hidden rounded-2xl md:grid-cols-4 md:grid-rows-2">
            <img
              src={property.photos[0]}
              alt={property.title}
              className="h-72 w-full object-cover md:col-span-2 md:row-span-2 md:h-full"
            />
            {property.photos.slice(1, 3).map((src: string, i: number) => (
              <img
                key={i}
                src={src}
                alt={`${property.title} — foto ${i + 2}`}
                loading="lazy"
                className="hidden h-full w-full object-cover md:col-span-1 md:block"
              />
            ))}
          </div>
        ) : (
          <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            Sem fotos ainda
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
          <div>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {property.city}, {property.state}
            </p>
            <h1 className="mt-1 font-display text-4xl font-semibold">{property.title}</h1>
            <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><BedDouble className="h-4 w-4" /> {property.bedrooms} quartos</span>
              <span className="flex items-center gap-2"><Bath className="h-4 w-4" /> {property.bathrooms} banheiros</span>
              <span className="flex items-center gap-2"><Users className="h-4 w-4" /> até {property.maxGuests} hóspedes</span>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <h2 className="font-display text-xl font-semibold">Sobre o imóvel</h2>
              <p className="mt-2 leading-relaxed text-foreground/80">{property.description}</p>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <h2 className="font-display text-xl font-semibold">Comodidades</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {property.amenities.map((a: string) => (
                  <li key={a} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> {a}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <h2 className="font-display text-xl font-semibold">Disponibilidade</h2>
              <p className="mt-1 text-sm text-muted-foreground">Datas em cinza já estão ocupadas ou solicitadas.</p>
              <div className="mt-4 inline-block rounded-xl border border-border bg-card p-3 shadow-soft">
                <Calendar
                  mode="multiple"
                  numberOfMonths={2}
                  disabled={booked}
                  className="pointer-events-auto"
                />
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-warm">
              <p className="text-sm text-muted-foreground">a partir de</p>
              <p className="mt-1 font-display text-3xl font-semibold">
                R$ {property.nightlyRate.toLocaleString("pt-BR")}
                <span className="ml-1 text-sm font-normal text-muted-foreground">/ noite</span>
              </p>
              <div className="mt-5 border-t border-border pt-5">
                <BookingRequestForm property={property} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
