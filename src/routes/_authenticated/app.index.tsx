import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Home, CalendarCheck, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchBookings, fetchAllProperties } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: bookings = [] } = useQuery({ queryKey: ["bookings"], queryFn: fetchBookings });
  const { data: properties = [] } = useQuery({ queryKey: ["properties"], queryFn: fetchAllProperties });

  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const pending = bookings.filter((b) => b.status === "pending");
  const revenue = confirmed.reduce((acc, b) => acc + b.totalAmount, 0);

  const metrics = [
    { label: "Imóveis ativos", value: properties.filter((p) => p.active).length, icon: Home },
    { label: "Reservas confirmadas", value: confirmed.length, icon: CalendarCheck },
    { label: "Solicitações pendentes", value: pending.length, icon: Clock },
    {
      label: "Receita prevista",
      value: `R$ ${revenue.toLocaleString("pt-BR")}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Olá 👋</h1>
        <p className="text-muted-foreground">Um resumo do que está acontecendo com seus imóveis.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.label}</CardTitle>
              <m.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="font-display text-2xl font-semibold">{m.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Próximas reservas</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma reserva ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hóspede</TableHead>
                  <TableHead>Imóvel</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Saída</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.guestName}</TableCell>
                    <TableCell className="text-muted-foreground">{b.propertyTitle}</TableCell>
                    <TableCell>{new Date(b.checkIn).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{new Date(b.checkOut).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {b.totalAmount.toLocaleString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    confirmed: { label: "Confirmada", variant: "default" },
    pending: { label: "Pendente", variant: "secondary" },
    cancelled: { label: "Cancelada", variant: "destructive" },
    completed: { label: "Concluída", variant: "outline" },
  };
  const cfg = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
