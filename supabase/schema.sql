-- ============================================================================
-- Ahorra — Esquema de base de datos (MVP v1.0)
-- ----------------------------------------------------------------------------
-- Pégalo COMPLETO en Supabase → SQL Editor → New query → Run.
-- Es idempotente: puedes correrlo más de una vez sin romper nada.
--
-- Modelo de seguridad: Row Level Security (RLS) en TODAS las tablas.
-- Cada usuario solo puede ver/editar sus propios datos (auth.uid() = user_id).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES  (extiende auth.users de Supabase)
--    Supabase ya maneja email/password en el esquema `auth`. Aquí guardamos
--    los datos de perfil de la app y la preferencia de moneda.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  name        text,
  avatar_url  text,
  currency    text not null default 'GTQ',   -- ISO 4217: GTQ, USD, MXN...
  onboarded   boolean not null default false, -- completó el flujo de onboarding
  created_at  timestamptz not null default now()
);

-- Si la tabla ya existía sin la columna, añádela (idempotente):
alter table public.profiles
  add column if not exists onboarded boolean not null default false;

-- ----------------------------------------------------------------------------
-- 2. MONTHS  (el sueldo se registra por mes; un mes agrupa los gastos)
-- ----------------------------------------------------------------------------
create table if not exists public.months (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  year        int  not null,
  month       int  not null check (month between 1 and 12),
  salary      numeric(14, 2) not null default 0,
  created_at  timestamptz not null default now(),
  unique (user_id, year, month)            -- un solo registro por mes/usuario
);

-- ----------------------------------------------------------------------------
-- 3. CATEGORIES  (comida, gasolina, etc.) con límite mensual opcional
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  name           text not null,
  icon           text,
  color          text,
  monthly_limit  numeric(14, 2),           -- null = sin límite
  created_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. EXPENSES  (cada gasto pertenece a un mes y a una categoría)
--    Guardamos user_id denormalizado para que las políticas RLS sean simples
--    y rápidas (sin subconsultas en cada lectura).
-- ----------------------------------------------------------------------------
create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  month_id     uuid not null references public.months (id) on delete cascade,
  category_id  uuid not null references public.categories (id) on delete restrict,
  amount       numeric(14, 2) not null check (amount >= 0),
  note         text,
  date         date not null default current_date,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. GOALS  (metas de ahorro: "Viaje a Japón - Q30,000")
-- ----------------------------------------------------------------------------
create table if not exists public.goals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  name            text not null,
  target_amount   numeric(14, 2) not null check (target_amount > 0),
  current_amount  numeric(14, 2) not null default 0,
  priority        int not null default 0,   -- para ordenar / dividir capital
  deadline        date,                      -- opcional
  created_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. RECURRING_EXPENSES  (gastos fijos para el motor de predicción)
-- ----------------------------------------------------------------------------
create table if not exists public.recurring_expenses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  category_id  uuid references public.categories (id) on delete set null,
  amount       numeric(14, 2) not null check (amount >= 0),
  description  text,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Índices para las consultas más frecuentes
-- ----------------------------------------------------------------------------
create index if not exists idx_months_user            on public.months (user_id);
create index if not exists idx_categories_user        on public.categories (user_id);
create index if not exists idx_expenses_user          on public.expenses (user_id);
create index if not exists idx_expenses_month         on public.expenses (month_id);
create index if not exists idx_expenses_category      on public.expenses (category_id);
create index if not exists idx_goals_user             on public.goals (user_id);
create index if not exists idx_recurring_user         on public.recurring_expenses (user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles            enable row level security;
alter table public.months              enable row level security;
alter table public.categories          enable row level security;
alter table public.expenses            enable row level security;
alter table public.goals               enable row level security;
alter table public.recurring_expenses  enable row level security;

-- PROFILES: el usuario solo gestiona su propia fila (id = auth.uid())
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Macro mental: para el resto de tablas, "dueño = user_id".
-- Definimos las 4 operaciones (select/insert/update/delete) por tabla.

-- MONTHS
drop policy if exists "months_all_own" on public.months;
create policy "months_all_own" on public.months
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CATEGORIES
drop policy if exists "categories_all_own" on public.categories;
create policy "categories_all_own" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- EXPENSES
drop policy if exists "expenses_all_own" on public.expenses;
create policy "expenses_all_own" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- GOALS
drop policy if exists "goals_all_own" on public.goals;
create policy "goals_all_own" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- RECURRING_EXPENSES
drop policy if exists "recurring_all_own" on public.recurring_expenses;
create policy "recurring_all_own" on public.recurring_expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER: crear automáticamente un profile al registrarse un usuario
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
