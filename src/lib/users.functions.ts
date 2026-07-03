import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AppRole = "admin" | "gestor";

export type ManagedUser = {
  id: string;
  email: string | null;
  name: string | null;
  provider: string;
  createdAt: string;
  lastSignInAt: string | null;
  roles: AppRole[];
};

async function ensureAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
  return supabaseAdmin;
}

export const listManagedUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ManagedUser[]> => {
    const admin = await ensureAdmin(context.userId);

    const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (usersError) throw new Error(usersError.message);

    const users = usersData.users;
    const ids = users.map((u) => u.id);

    const { data: roleRows, error: rolesError } = await admin
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    if (rolesError) throw new Error(rolesError.message);

    const rolesByUser = new Map<string, AppRole[]>();
    for (const r of roleRows ?? []) {
      const arr = rolesByUser.get(r.user_id) ?? [];
      arr.push(r.role as AppRole);
      rolesByUser.set(r.user_id, arr);
    }

    return users.map((u) => {
      const identities = u.identities ?? [];
      const providers = identities.map((i) => i.provider).filter(Boolean);
      const provider = providers.includes("google")
        ? "google"
        : providers[0] ?? "email";
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      const name =
        (meta.full_name as string | undefined) ??
        (meta.name as string | undefined) ??
        null;
      return {
        id: u.id,
        email: u.email ?? null,
        name,
        provider,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        roles: rolesByUser.get(u.id) ?? [],
      };
    });
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; role: AppRole; grant: boolean }) => input)
  .handler(async ({ data, context }) => {
    const admin = await ensureAdmin(context.userId);
    if (data.grant) {
      const { error } = await admin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      if (data.userId === context.userId && data.role === "admin") {
        throw new Error("Você não pode remover seu próprio papel de admin.");
      }
      const { error } = await admin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });
