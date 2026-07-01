import { supabase } from "@/integrations/supabase/client";

// ---------- Tipos usados pelas telas (camelCase) ----------
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
  cleaningFee: number;
  laundryFee: number;
  description: string;
  amenities: string[];
  photos: string[];
  coverPhoto: string;
  active: boolean;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type Booking = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string; // ISO date
  checkOut: string;
  guests: number;
  status: BookingStatus;
  nightlyRate: number;
  cleaningFee: number;
  laundryFee: number;
  totalAmount: number;
  message?: string;
  createdAt: string;
};

export type DateRange = { from: Date; to: Date };

// ---------- Tradutores (linha do banco -> objeto da tela) ----------
/* eslint-disable @typescript-eslint/no-explicit-any */
function mapProperty(row: any): Property {
  const photos: string[] = (row.property_photos ?? [])
    .slice()
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
    .map((p: any) => p.url);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    city: row.city ?? "",
    state: row.state ?? "",
    bedrooms: row.bedrooms ?? 0,
    bathrooms: row.bathrooms ?? 0,
    maxGuests: row.max_guests ?? 1,
    nightlyRate: Number(row.nightly_rate ?? 0),
    cleaningFee: Number(row.cleaning_fee ?? 0),
    laundryFee: Number(row.laundry_fee ?? 0),
    description: row.description ?? "",
    amenities: row.amenities ?? [],
    photos,
    coverPhoto: row.cover_photo ?? photos[0] ?? "",
    active: row.active ?? true,
  };
}

function mapBooking(row: any): Booking {
  return {
    id: row.id,
    propertyId: row.property_id,
    propertyTitle: row.properties?.title ?? "",
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    guestPhone: row.guest_phone ?? "",
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: row.guests ?? 1,
    status: row.status,
    nightlyRate: Number(row.nightly_rate ?? 0),
    cleaningFee: Number(row.cleaning_fee ?? 0),
    laundryFee: Number(row.laundry_fee ?? 0),
    totalAmount: Number(row.total_amount ?? 0),
    message: row.message ?? undefined,
    createdAt: row.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const PROPERTY_SELECT = "*, property_photos(url, position)";

// ---------- Imóveis (leitura) ----------
export async function fetchActiveProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapProperty);
}

export async function fetchAllProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapProperty);
}

export async function fetchPropertyBySlug(slug: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProperty(data) : null;
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProperty(data) : null;
}

// Datas ocupadas (público, sem dados do hóspede) via RPC.
export async function fetchUnavailableRanges(propertyId: string): Promise<DateRange[]> {
  const { data, error } = await supabase.rpc("get_property_availability", {
    _property_id: propertyId,
  });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    from: new Date(r.start_date),
    to: new Date(r.end_date),
  }));
}

// ---------- Imóveis (escrita — só gestor) ----------
function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "imovel"}-${suffix}`;
}

export type PropertyInput = {
  title: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  nightlyRate: number;
  cleaningFee: number;
  laundryFee: number;
  description: string;
};

export async function createProperty(input: PropertyInput, files: File[]): Promise<string> {
  const { data, error } = await supabase
    .from("properties")
    .insert({
      slug: slugify(input.title),
      title: input.title,
      city: input.city,
      state: input.state,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      max_guests: input.maxGuests,
      nightly_rate: input.nightlyRate,
      cleaning_fee: input.cleaningFee,
      laundry_fee: input.laundryFee,
      description: input.description,
    })
    .select("id")
    .single();
  if (error) throw error;
  const propertyId = data.id;

  if (files.length > 0) {
    const urls = await uploadPhotos(propertyId, files);
    await supabase
      .from("property_photos")
      .insert(urls.map((url, i) => ({ property_id: propertyId, url, position: i })));
    await supabase.from("properties").update({ cover_photo: urls[0] }).eq("id", propertyId);
  }
  return propertyId;
}

export async function updateProperty(id: string, input: PropertyInput): Promise<void> {
  const { error } = await supabase
    .from("properties")
    .update({
      title: input.title,
      city: input.city,
      state: input.state,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      max_guests: input.maxGuests,
      nightly_rate: input.nightlyRate,
      cleaning_fee: input.cleaningFee,
      laundry_fee: input.laundryFee,
      description: input.description,
    })
    .eq("id", id);
  if (error) throw error;
}

async function uploadPhotos(propertyId: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${propertyId}/${i}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("property-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("property-photos").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

// ---------- Reservas ----------
export type BookingRequestInput = {
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  message?: string;
  nightlyRate: number;
  cleaningFee: number;
  laundryFee: number;
};

function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

export function computeTotal(input: {
  checkIn: string;
  checkOut: string;
  nightlyRate: number;
  cleaningFee: number;
  laundryFee: number;
}): { nights: number; nightsTotal: number; total: number } {
  const nights = nightsBetween(input.checkIn, input.checkOut);
  const nightsTotal = nights * input.nightlyRate;
  return { nights, nightsTotal, total: nightsTotal + input.cleaningFee + input.laundryFee };
}

// Pública: cria solicitação 'pending' com valores congelados do imóvel.
export async function createBookingRequest(input: BookingRequestInput): Promise<void> {
  const { total } = computeTotal(input);
  const { error } = await supabase.from("bookings").insert({
    property_id: input.propertyId,
    guest_name: input.guestName,
    guest_email: input.guestEmail,
    guest_phone: input.guestPhone,
    check_in: input.checkIn,
    check_out: input.checkOut,
    guests: input.guests,
    status: "pending",
    nightly_rate: input.nightlyRate,
    cleaning_fee: input.cleaningFee,
    laundry_fee: input.laundryFee,
    total_amount: total,
    message: input.message || null,
  });
  if (error) throw error;
}

export async function fetchBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, properties(title)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBooking);
}

// Confirma uma reserva após checar disponibilidade (anti-overbooking).
export async function confirmBooking(booking: Booking): Promise<void> {
  const { data: available, error: checkError } = await supabase.rpc("check_availability", {
    _property_id: booking.propertyId,
    _check_in: booking.checkIn,
    _check_out: booking.checkOut,
    _exclude_booking_id: booking.id,
  });
  if (checkError) throw checkError;
  if (!available) {
    throw new Error("Estas datas já estão ocupadas por outra reserva confirmada ou bloqueio.");
  }
  const { error } = await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", booking.id);
  if (error) throw error;
}

export async function setBookingStatus(id: string, status: BookingStatus): Promise<void> {
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) throw error;
}
