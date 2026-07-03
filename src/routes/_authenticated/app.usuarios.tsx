import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Shield, ShieldOff, UserCog } from "lucide-react";
import {
  listManagedUsers,
  setUserRole,
  checkIsAdmin,
  type ManagedUser,
} from "@/lib/users.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/app/usuarios")({
  head: () => ({ meta: [{ title: "Usuários — Coastal Stays" }] }),
  component: UsuariosPage,
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-destructive">
      Erro ao carregar usuários: {error.message}
    </div>
  ),
});

function providerLabel(p: string) {
  if (p === "google") return "Google";
  if (p === "email") return "E-mail/Senha";
  return p;
}

function UsuariosPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const list = useServerFn(listManagedUsers);
  const check = useServerFn(checkIsAdmin);
  const mutate = useServerFn(setUserRole);

  const adminQuery = useQuery({ queryKey: ["is-admin"], queryFn: () => check({}) });

  const usersQuery = useQuery({
    queryKey: ["managed-users"],
    queryFn: () => list({}),
    enabled: !!adminQuery.data?.isAdmin,
  });

  const roleMutation = useMutation({
    mutationFn: (vars: { userId: string; role: "admin" | "gestor"; grant: boolean }) =>
      mutate({ data: vars }),
    onSuccess: () => {
      toast.success("Papel atualizado");
      qc.invalidateQueries({ queryKey: ["managed-users"] });
    },
    onError: (e: Error) => toast.error("Falha", { description: e.message }),
  });

  if (adminQuery.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando…</div>;
  }

  if (!adminQuery.data?.isAdmin) {
    return (
      <div className="p-6">
        <h1 className="font-display text-2xl font-semibold">Acesso restrito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Apenas administradores podem gerenciar usuários.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <UserCog className="h-6 w-6" /> Usuários
          </h1>
          <p className="text-sm text-muted-foreground">
            Todas as pessoas que já entraram no painel (e-mail/senha ou Google).
          </p>
        </div>
        <Button variant="outline" onClick={() => router.invalidate()}>
          Recarregar
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Entrou por</TableHead>
              <TableHead>Último acesso</TableHead>
              <TableHead>Papéis</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersQuery.isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Carregando…
                </TableCell>
              </TableRow>
            )}
            {usersQuery.data?.map((u: ManagedUser) => {
              const isAdmin = u.roles.includes("admin");
              const isGestor = u.roles.includes("gestor");
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
                  <TableCell>{u.email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{providerLabel(u.provider)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.lastSignInAt
                      ? new Date(u.lastSignInAt).toLocaleString("pt-BR")
                      : "—"}
                  </TableCell>
                  <TableCell className="space-x-1">
                    {isAdmin && <Badge>admin</Badge>}
                    {isGestor && <Badge variant="outline">gestor</Badge>}
                    {!isAdmin && !isGestor && (
                      <span className="text-xs text-muted-foreground">sem papel</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant={isGestor ? "outline" : "default"}
                      disabled={roleMutation.isPending}
                      onClick={() =>
                        roleMutation.mutate({
                          userId: u.id,
                          role: "gestor",
                          grant: !isGestor,
                        })
                      }
                    >
                      {isGestor ? "Remover gestor" : "Tornar gestor"}
                    </Button>
                    <Button
                      size="sm"
                      variant={isAdmin ? "outline" : "secondary"}
                      disabled={roleMutation.isPending}
                      onClick={() =>
                        roleMutation.mutate({
                          userId: u.id,
                          role: "admin",
                          grant: !isAdmin,
                        })
                      }
                    >
                      {isAdmin ? (
                        <>
                          <ShieldOff className="mr-1 h-4 w-4" /> Rebaixar
                        </>
                      ) : (
                        <>
                          <Shield className="mr-1 h-4 w-4" /> Promover a admin
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {usersQuery.data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
