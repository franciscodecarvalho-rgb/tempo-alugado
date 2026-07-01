import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  fetchBookings,
  confirmBooking,
  setBookingStatus,
  type Booking,
  type BookingStatus,
} from "@/lib/api";

export const Route = createFileRoute("/_authenticated/app/reservas")({
  component: ReservasPage,
});

function ReservasPage() {
  const queryClient = useQueryClient();
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["bookings"] });

  const confirm = useMutation({
    mutationFn: (b: Booking) => confirmBooking(b),
    onSuccess: () => {
      toast.success("Reserva confirmada");
      invalidate();
    },
    onError: (err) =>
      toast.error("Não foi possível confirmar", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      }),
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) => setBookingStatus(id, status),
    onSuccess: () => {
      toast.success("Reserva atualizada");
      invalidate();
    },
    onError: () => toast.error("Não foi possível atualizar"),
  });

  const pending = bookings.filter((b) => b.status === "pending");
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Reservas</h1>
        <p className="text-muted-foreground">Aprove pré-reservas e gerencie confirmadas.</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando reservas...</p>}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendentes ({pending.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmadas ({confirmed.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Canceladas ({cancelled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-3">
          {pending.length === 0 && <p className="text-sm text-muted-foreground">Nada por aqui.</p>}
          {pending.map((b) => (
            <BookingItem
              key={b.id}
              b={b}
              onConfirm={() => confirm.mutate(b)}
              onCancel={() => changeStatus.mutate({ id: b.id, status: "cancelled" })}
              busy={confirm.isPending || changeStatus.isPending}
              showActions
            />
          ))}
        </TabsContent>
        <TabsContent value="confirmed" className="space-y-3">
          {confirmed.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma reserva confirmada.</p>}
          {confirmed.map((b) => (
            <BookingItem key={b.id} b={b} onCancel={() => changeStatus.mutate({ id: b.id, status: "cancelled" })} />
          ))}
        </TabsContent>
        <TabsContent value="cancelled" className="space-y-3">
          {cancelled.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma reserva cancelada.</p>}
          {cancelled.map((b) => <BookingItem key={b.id} b={b} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}

const statusMap: Record<BookingStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  confirmed: { label: "Confirmada", variant: "default" },
  pending: { label: "Pendente", variant: "secondary" },
  cancelled: { label: "Cancelada", variant: "destructive" },
  completed: { label: "Concluída", variant: "outline" },
};

function BookingItem({
  b,
  onConfirm,
  onCancel,
  showActions,
  busy,
}: {
  b: Booking;
  onConfirm?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
  busy?: boolean;
}) {
  return (
    <Card className="shadow-soft">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">{b.guestName}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{b.propertyTitle}</p>
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
          {b.guestPhone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {b.guestPhone}</span>}
        </div>
        {b.message && (
          <p className="rounded-md bg-muted/50 p-3 text-sm italic text-foreground/80">"{b.message}"</p>
        )}
        {showActions && (
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onCancel} disabled={busy}>
              <X className="mr-1 h-3.5 w-3.5" /> Recusar
            </Button>
            <Button size="sm" onClick={onConfirm} disabled={busy}>
              <Check className="mr-1 h-3.5 w-3.5" /> Confirmar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
