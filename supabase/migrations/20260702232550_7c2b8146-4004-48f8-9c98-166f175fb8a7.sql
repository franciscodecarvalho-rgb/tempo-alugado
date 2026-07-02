
-- 1) Restrict is_staff() to real staff roles (admin or gestor), not "any row"
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('admin'::public.app_role, 'gestor'::public.app_role)
  );
$$;

-- 2) Lock down SECURITY DEFINER functions: revoke broad EXECUTE, grant only where needed
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.get_property_availability(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_property_availability(uuid) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.check_availability(uuid, date, date, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_availability(uuid, date, date, uuid) TO authenticated;

-- Trigger-only helpers: no direct API execution
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- 3) Public SELECT policy on blocked_dates so the public availability calendar can read it
CREATE POLICY "public reads blocked dates of active properties"
ON public.blocked_dates
FOR SELECT
USING (
  exists (
    select 1 from public.properties p
    where p.id = blocked_dates.property_id and p.active
  )
);

GRANT SELECT ON public.blocked_dates TO anon, authenticated;
