import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

export function BookingRequestForm({ propertyTitle }: { propertyTitle: string }) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { guests: 2 },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      // TODO: chamar createBookingRequest server fn assim que o schema estiver definido.
      await new Promise((r) => setTimeout(r, 700));
      toast.success("Solicitação enviada!", {
        description: `Recebemos seu pedido para ${propertyTitle}. Retornaremos em breve.`,
      });
      form.reset({ guests: 2 });
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
