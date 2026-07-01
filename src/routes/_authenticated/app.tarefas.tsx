import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/tarefas")({
  component: TarefasPage,
});

function TarefasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Tarefas</h1>
        <p className="text-muted-foreground">Limpeza, manutenção e check-ins.</p>
      </div>
      <Card className="shadow-soft">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl font-semibold">Em breve</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Estamos preparando o módulo de tarefas para você atribuir limpezas e manutenção às equipes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
