-- =============================================================
-- Tempo Alugado — schema inicial
-- Gestão de imóveis de temporada: vitrine pública + painel interno.
-- Modelo de reserva em tabela única (bookings) com status;
-- público só cria 'pending', gestor confirma após checagem de disponibilidade.
-- =============================================================

-- ---------- Papéis de usuário (padrão seguro: role fora do profile) ----------
create type public.app_role as enum ('admin', 'gestor');

-- ---------- Tabelas ----------
create table public.properties (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  city          text,
  state         text,
  bedrooms      integer not null default 0,
  bathrooms     integer not null default 0,
  max_guests    integer not null default 1,
  nightly_rate  numeric(10,2) not null default 0,
  cleaning_fee  numeric(10,2) not null default 0,   -- fixa por reserva
  laundry_fee   numeric(10,2) not null default 0,   -- fixa por reserva
  description   text,
  amenities     text[] not null default '{}',
  cover_photo   text,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.property_photos (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties(id) on delete cascade,
  url          text not null,
  position     integer not null default 0,
  created_at   timestamptz not null default now()
);
create index property_photos_property_id_idx on public.property_photos(property_id);

create table public.bookings (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references public.properties(id) on delete restrict,
  guest_name    text not null,
  guest_email   text not null,
  guest_phone   text,
  check_in      date not null,
  check_out     date not null,
  guests        integer not null default 1,
  status        text not null default 'pending'
                  check (status in ('pending','confirmed','cancelled','completed')),
  -- valores congelados no momento da criação/confirmação (histórico correto)
  nightly_rate  numeric(10,2) not null default 0,
  cleaning_fee  numeric(10,2) not null default 0,
  laundry_fee   numeric(10,2) not null default 0,
  total_amount  numeric(10,2) not null default 0,
  message       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint bookings_dates_check check (check_out > check_in)
);
create index bookings_property_id_idx on public.bookings(property_id);
create index bookings_status_idx on public.bookings(status);

create table public.blocked_dates (
  id           uuid primary key default gen_random_uuid(),
  property_id  uuid not null references public.properties(id) on delete cascade,
  start_date   date not null,
  end_date     date not null,
  reason       text,
  created_at   timestamptz not null default now(),
  constraint blocked_dates_range_check check (end_date > start_date)
);
create index blocked_dates_property_id_idx on public.blocked_dates(property_id);

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  email       text,
  created_at  timestamptz not null default now()
);

create table public.user_roles (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      public.app_role not null,
  unique (user_id, role)
);

-- ---------- Funções ----------
-- search_path = '' + refs totalmente qualificadas (exigência do linter Supabase).

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- Qualquer usuário com papel = equipe interna (gate do painel).
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid());
$$;

-- Disponibilidade pública (sem PII): retorna faixas ocupadas de um imóvel.
-- Inclui reservas pending+confirmed e bloqueios manuais.
create or replace function public.get_property_availability(_property_id uuid)
returns table (start_date date, end_date date)
language sql stable security definer set search_path = '' as $$
  select check_in, check_out
    from public.bookings
   where property_id = _property_id and status in ('pending','confirmed')
  union all
  select start_date, end_date
    from public.blocked_dates
   where property_id = _property_id;
$$;
grant execute on function public.get_property_availability(uuid) to anon, authenticated;

-- Checagem anti-overbooking usada na aprovação (retorna true se livre).
-- Só considera reservas 'confirmed' + bloqueios; ignora a própria reserva ao reeditar.
create or replace function public.check_availability(
  _property_id uuid, _check_in date, _check_out date, _exclude_booking_id uuid default null
) returns boolean
language sql stable security definer set search_path = '' as $$
  select
    not exists (
      select 1 from public.bookings
      where property_id = _property_id
        and status = 'confirmed'
        and (_exclude_booking_id is null or id <> _exclude_booking_id)
        and check_in < _check_out and check_out > _check_in
    )
    and not exists (
      select 1 from public.blocked_dates
      where property_id = _property_id
        and start_date < _check_out and end_date > _check_in
    );
$$;
grant execute on function public.check_availability(uuid, date, date, uuid) to authenticated;

-- Cria profile ao registrar; o PRIMEIRO usuário vira 'gestor' (bootstrap da equipe).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email
  );
  if not exists (select 1 from public.user_roles) then
    insert into public.user_roles (user_id, role) values (new.id, 'gestor');
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at automático.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger properties_set_updated_at before update on public.properties
  for each row execute function public.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

-- ---------- RLS ----------
alter table public.properties      enable row level security;
alter table public.property_photos enable row level security;
alter table public.bookings        enable row level security;
alter table public.blocked_dates   enable row level security;
alter table public.profiles        enable row level security;
alter table public.user_roles      enable row level security;

-- properties: vitrine pública (só ativos) + staff gere tudo.
create policy "public reads active properties" on public.properties
  for select using (active = true);
create policy "staff manages properties" on public.properties
  for all using (public.is_staff()) with check (public.is_staff());

-- property_photos: leitura pública se o imóvel está ativo; staff gere.
create policy "public reads photos of active properties" on public.property_photos
  for select using (
    exists (select 1 from public.properties p where p.id = property_id and p.active)
  );
create policy "staff manages photos" on public.property_photos
  for all using (public.is_staff()) with check (public.is_staff());

-- bookings: público só INSERT como 'pending'; sem SELECT público (protege PII).
create policy "public creates pending bookings" on public.bookings
  for insert with check (status = 'pending');
create policy "staff reads bookings" on public.bookings
  for select using (public.is_staff());
create policy "staff updates bookings" on public.bookings
  for update using (public.is_staff()) with check (public.is_staff());
create policy "staff deletes bookings" on public.bookings
  for delete using (public.is_staff());

-- blocked_dates: só staff (público vê faixas via RPC).
create policy "staff manages blocked dates" on public.blocked_dates
  for all using (public.is_staff()) with check (public.is_staff());

-- profiles: cada um lê/edita o seu.
create policy "users read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- user_roles: dono lê o seu; só admin altera.
create policy "users read own roles" on public.user_roles
  for select using (auth.uid() = user_id);
create policy "admins manage roles" on public.user_roles
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ---------- Storage: bucket público de fotos ----------
insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

create policy "public reads property photos" on storage.objects
  for select using (bucket_id = 'property-photos');
create policy "staff uploads property photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'property-photos' and public.is_staff());
create policy "staff updates property photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'property-photos' and public.is_staff());
create policy "staff deletes property photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'property-photos' and public.is_staff());
