import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchAllProperties, fetchUnavailableRanges, fetchBookings } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/app/calendario")({
  component: CalendarPage,
});

function CalendarPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const { data: properties = [] } = useQuery({ queryKey: ["properties"], queryFn: fetchAllProperties });
  const { data: allBookings = [] } = useQuery({ queryKey: ["bookings"], queryFn: fetchBookings });

  const propertyId = selected ?? properties[0]?.id ?? null;

  const { data: booked = [] } = useQuery({
    queryKey: ["availability", propertyId],
    queryFn: () => fetchUnavailableRanges(propertyId as string),
    enabled: !!propertyId,
  });

  const bookings = allBookings.filter((b) => b.propertyId === propertyId && b.status !== "cancelled");

  if (properties.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold">Calendário</h1>
        <p className="text-muted-foreground">Cadastre um imóvel para ver a ocupação.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Calendário</h1>
          <p className="text-muted-foreground">Visualize a ocupação de cada imóvel.</p>
        </div>
        <Select value={propertyId ?? undefined} onValueChange={setSelected}>
          <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Ocupação</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="multiple"
              numberOfMonths={2}
              disabled={booked}
              className="pointer-events-auto mx-auto"
            />
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Reservas do período</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.length === 0 && (
              <p className="text-sm text-muted-foreground">Sem reservas para este imóvel.</p>
            )}
            {bookings.map((b) => (
              <div key={b.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{b.guestName}</p>
                  <Badge variant={b.status === "confirmed" ? "default" : "secondary"}>
                    {b.status === "confirmed" ? "Confirmada" : "Pendente"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(b.checkIn).toLocaleDateString("pt-BR")} → {new Date(b.checkOut).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
