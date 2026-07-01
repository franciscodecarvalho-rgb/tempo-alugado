import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MOCK_BOOKINGS, MOCK_PROPERTIES, type Booking } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/app/reservas")({
  component: ReservasPage,
});

function ReservasPage() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);

  const update = (id: string, status: Booking["status"]) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    toast.success(status === "confirmed" ? "Reserva confirmada" : "Reserva atualizada");
  };

  const pending = bookings.filter((b) => b.status === "pending");
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Reservas</h1>
        <p className="text-muted-foreground">Aprove pré-reservas e gerencie confirmadas.</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendentes ({pending.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmadas ({confirmed.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Canceladas ({cancelled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-3">
          {pending.length === 0 && <p className="text-sm text-muted-foreground">Nada por aqui.</p>}
          {pending.map((b) => (
            <BookingItem key={b.id} b={b} onConfirm={() => update(b.id, "confirmed")} onCancel={() => update(b.id, "cancelled")} showActions />
          ))}
        </TabsContent>
        <TabsContent value="confirmed" className="space-y-3">
          {confirmed.map((b) => <BookingItem key={b.id} b={b} onCancel={() => update(b.id, "cancelled")} />)}
        </TabsContent>
        <TabsContent value="cancelled" className="space-y-3">
          {cancelled.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma reserva cancelada.</p>}
          {cancelled.map((b) => <BookingItem key={b.id} b={b} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingItem({
  b,
  onConfirm,
  onCancel,
  showActions,
}: {
  b: Booking;
  onConfirm?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
}) {
  const property = MOCK_PROPERTIES.find((p) => p.id === b.propertyId);
  const statusMap: Record<Booking["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    confirmed: { label: "Confirmada", variant: "default" },
    pending: { label: "Pendente", variant: "secondary" },
    cancelled: { label: "Cancelada", variant: "destructive" },
    completed: { label: "Concluída", variant: "outline" },
  };

  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">{b.guestName}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{property?.title}</p>
        </div>
        <Badge variant={statusMap[b.status].variant}>{statusMap[b.status].label}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Entrada → Saída</p>
            <p>{new Date(b.checkIn).toLocaleDateString("pt-BR")} → {new Date(b.checkOut).toLocaleDateString("pt-BR")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Hóspedes</p>
            <p>{b.guests}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p>R$ {b.totalAmount.toLocaleString("pt-BR")}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {b.guestEmail}</span>
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {b.guestPhone}</span>
        </div>
        {b.message && (
          <p className="rounded-md bg-muted/50 p-3 text-sm italic text-foreground/80">"{b.message}"</p>
        )}
        {showActions && (
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="mr-1 h-3.5 w-3.5" /> Recusar
            </Button>
            <Button size="sm" onClick={onConfirm}>
              <Check className="mr-1 h-3.5 w-3.5" /> Confirmar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
