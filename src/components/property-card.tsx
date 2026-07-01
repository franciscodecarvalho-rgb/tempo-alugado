import { Link } from "@tanstack/react-router";
import { BedDouble, Bath, Users, MapPin, ImageOff } from "lucide-react";
import type { Property } from "@/lib/api";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      to="/imovel/$slug"
      params={{ slug: property.slug }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-warm"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {property.coverPhoto ? (
          <img
            src={property.coverPhoto}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        <div className="absolute right-3 top-3 rounded-full bg-background/95 px-3 py-1 text-xs font-medium">
          R$ {property.nightlyRate.toLocaleString("pt-BR")}<span className="text-muted-foreground">/noite</span>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight">{property.title}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {property.city}, {property.state}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {property.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {property.bathrooms}</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> até {property.maxGuests}</span>
        </div>
      </div>
    </Link>
  );
}
