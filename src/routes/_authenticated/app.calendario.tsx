import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MOCK_PROPERTIES, getBookedRanges, MOCK_BOOKINGS } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/app/calendario")({
  component: CalendarPage,
});

function CalendarPage() {
  const [propertyId, setPropertyId] = useState(MOCK_PROPERTIES[0].id);
  const booked = getBookedRanges(propertyId);
  const bookings = MOCK_BOOKINGS.filter((b) => b.propertyId === propertyId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Calendário</h1>
          <p className="text-muted-foreground">Visualize a ocupação de cada imóvel.</p>
        </div>
        <Select value={propertyId} onValueChange={setPropertyId}>
          <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {MOCK_PROPERTIES.map((p) => (
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
