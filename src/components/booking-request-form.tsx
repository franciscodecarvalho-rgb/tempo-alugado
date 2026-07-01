import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBookingRequest, computeTotal, type Property } from "@/lib/api";

const schema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome").max(100),
    email: z.string().trim().email("E-mail inválido").max(255),
    phone: z.string().trim().min(8, "Informe um telefone válido").max(30),
    checkIn: z.string().min(1, "Selecione a data de entrada"),
    checkOut: z.string().min(1, "Selecione a data de saída"),
    guests: z.coerce.number().int().min(1).max(20),
    message: z.string().trim().max(1000).optional(),
  })
  .refine((d) => new Date(d.checkOut) > new Date(d.checkIn), {
    message: "Saída deve ser após a entrada",
    path: ["checkOut"],
  });

type FormValues = z.infer<typeof schema>;

const brl = (v: number) => `R$ ${v.toLocaleString("pt-BR")}`;

export function BookingRequestForm({ property }: { property: Property }) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { guests: 2 },
  });

  // Desdobramento de preço reativo às datas escolhidas.
  const checkIn = form.watch("checkIn");
  const checkOut = form.watch("checkOut");
  const breakdown =
    checkIn && checkOut && new Date(checkOut) > new Date(checkIn)
      ? computeTotal({
          checkIn,
          checkOut,
          nightlyRate: property.nightlyRate,
          cleaningFee: property.cleaningFee,
          laundryFee: property.laundryFee,
        })
      : null;

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await createBookingRequest({
        propertyId: property.id,
        guestName: values.name,
        guestEmail: values.email,
        guestPhone: values.phone,
        checkIn: values.checkIn,
        checkOut: values.checkOut,
        guests: values.guests,
        message: values.message,
        nightlyRate: property.nightlyRate,
        cleaningFee: property.cleaningFee,
        laundryFee: property.laundryFee,
      });
      toast.success("Solicitação enviada!", {
        description: `Recebemos seu pedido para ${property.title}. Retornaremos em breve.`,
      });
      form.reset({ guests: 2 });
    } catch (err) {
      toast.error("Não foi possível enviar", {
        description: err instanceof Error ? err.message : "Tente novamente em instantes.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="checkIn">Entrada</Label>
          <Input id="checkIn" type="date" {...form.register("checkIn")} />
          {form.formState.errors.checkIn && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.checkIn.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="checkOut">Saída</Label>
          <Input id="checkOut" type="date" {...form.register("checkOut")} />
          {form.formState.errors.checkOut && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.checkOut.message}</p>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="guests">Hóspedes</Label>
        <Input id="guests" type="number" min={1} max={20} {...form.register("guests")} />
      </div>

      {breakdown && (
        <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>
              {brl(property.nightlyRate)} × {breakdown.nights}{" "}
              {breakdown.nights === 1 ? "noite" : "noites"}
            </span>
            <span>{brl(breakdown.nightsTotal)}</span>
          </div>
          {property.cleaningFee > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Taxa de limpeza</span>
              <span>{brl(property.cleaningFee)}</span>
            </div>
          )}
          {property.laundryFee > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Lavanderia</span>
              <span>{brl(property.laundryFee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-1 font-medium text-foreground">
            <span>Total</span>
            <span>{brl(breakdown.total)}</span>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" {...form.register("name")} placeholder="Como devemos te chamar" />
        {form.formState.errors.name && (
          <p className="mt-1 text-xs text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="phone">Telefone / WhatsApp</Label>
          <Input id="phone" {...form.register("phone")} placeholder="(11) 99999-9999" />
          {form.formState.errors.phone && (
            <p className="mt-1 text-xs text-destructive">{form.formState.errors.phone.message}</p>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="message">Mensagem (opcional)</Label>
        <Textarea id="message" rows={3} {...form.register("message")} placeholder="Conte um pouco sobre sua viagem" />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Enviando..." : "Solicitar reserva"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Sua solicitação é enviada ao gestor. Você recebe confirmação por e-mail.
      </p>
    </form>
  );
}
