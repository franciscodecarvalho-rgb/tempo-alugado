import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";

export type Property = {
  id: string;
  slug: string;
  title: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  nightlyRate: number;
  description: string;
  amenities: string[];
  photos: string[];
  coverPhoto: string;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type Booking = {
  id: string;
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string; // ISO date
  checkOut: string;
  guests: number;
  status: BookingStatus;
  totalAmount: number;
  message?: string;
  createdAt: string;
};

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "p1",
    slug: "casa-vista-mar-jericoacoara",
    title: "Casa Vista Mar",
    city: "Jericoacoara",
    state: "CE",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    nightlyRate: 780,
    description:
      "Casa acolhedora a 200m da praia, com varanda de frente para o mar, cozinha completa e área externa com rede.",
    amenities: ["Wi-Fi", "Ar-condicionado", "Cozinha equipada", "Estacionamento", "Vista mar"],
    photos: [property1, property2, property3],
    coverPhoto: property1,
  },
  {
    id: "p2",
    slug: "villa-piscina-infinita-buzios",
    title: "Villa Piscina Infinita",
    city: "Búzios",
    state: "RJ",
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    nightlyRate: 1450,
    description:
      "Villa contemporânea com piscina de borda infinita, acesso privativo à enseada e serviço de concierge.",
    amenities: ["Piscina", "Wi-Fi", "Ar-condicionado", "Churrasqueira", "Vista mar", "Serviço de limpeza"],
    photos: [property2, property1, property3],
    coverPhoto: property2,
  },
  {
    id: "p3",
    slug: "chale-rustico-praia-do-rosa",
    title: "Chalé Rústico Beira-Mar",
    city: "Praia do Rosa",
    state: "SC",
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    nightlyRate: 520,
    description:
      "Chalé em madeira com deck, redes e acesso direto à praia. Ideal para casais e famílias pequenas.",
    amenities: ["Wi-Fi", "Rede", "Cozinha", "Pet friendly"],
    photos: [property3, property1, property2],
    coverPhoto: property3,
  },
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "b1",
    propertyId: "p1",
    guestName: "Ana Silva",
    guestEmail: "ana@example.com",
    guestPhone: "+55 11 99999-1111",
    checkIn: "2026-07-10",
    checkOut: "2026-07-17",
    guests: 4,
    status: "confirmed",
    totalAmount: 5460,
    createdAt: "2026-06-15",
  },
  {
    id: "b2",
    propertyId: "p2",
    guestName: "Bruno Costa",
    guestEmail: "bruno@example.com",
    guestPhone: "+55 21 98888-2222",
    checkIn: "2026-07-20",
    checkOut: "2026-07-27",
    guests: 6,
    status: "pending",
    totalAmount: 10150,
    message: "Chegaremos por volta das 18h, se possível.",
    createdAt: "2026-06-28",
  },
  {
    id: "b3",
    propertyId: "p3",
    guestName: "Carla Menezes",
    guestEmail: "carla@example.com",
    guestPhone: "+55 48 97777-3333",
    checkIn: "2026-08-01",
    checkOut: "2026-08-05",
    guests: 2,
    status: "confirmed",
    totalAmount: 2080,
    createdAt: "2026-06-20",
  },
  {
    id: "b4",
    propertyId: "p1",
    guestName: "Diego Alves",
    guestEmail: "diego@example.com",
    guestPhone: "+55 11 96666-4444",
    checkIn: "2026-07-25",
    checkOut: "2026-07-30",
    guests: 3,
    status: "pending",
    totalAmount: 3900,
    message: "Podemos levar um cachorro pequeno?",
    createdAt: "2026-06-30",
  },
];

export function getPropertyBySlug(slug: string): Property | undefined {
  return MOCK_PROPERTIES.find((p) => p.slug === slug);
}

export function getBookedRanges(propertyId: string): { from: Date; to: Date }[] {
  return MOCK_BOOKINGS.filter(
    (b) => b.propertyId === propertyId && (b.status === "confirmed" || b.status === "pending"),
  ).map((b) => ({ from: new Date(b.checkIn), to: new Date(b.checkOut) }));
}
