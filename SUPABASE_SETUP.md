# Supabase Setup

## Variables d'environnement

Ajoute ces variables dans Vercel et en local:

```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
REACT_APP_ENABLE_API_MOCKS=false
```

Pour un mode demo simple, desactive aussi la confirmation email dans `Authentication > Providers > Email`.

## SQL a executer

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'owner', 'staff')),
  avatar text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade unique,
  name text not null,
  logo text,
  address text,
  postal_code text,
  country text,
  phone_number text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete set null,
  reference text not null,
  name text not null,
  category text not null,
  price numeric not null default 0,
  stock integer not null default 0,
  image text,
  images text[] not null default '{}',
  age_range text,
  gender text,
  status text not null check (status in ('in_stock', 'out_of_stock', 'low_stock')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## RLS policies

```sql
alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.products enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

create policy "shops_select_own" on public.shops
for select using (auth.uid() = owner_id);

create policy "shops_insert_own" on public.shops
for insert with check (auth.uid() = owner_id);

create policy "shops_update_own" on public.shops
for update using (auth.uid() = owner_id);

create policy "products_select_own" on public.products
for select using (auth.uid() = owner_id);

create policy "products_insert_own" on public.products
for insert with check (auth.uid() = owner_id);

create policy "products_update_own" on public.products
for update using (auth.uid() = owner_id);

create policy "products_delete_own" on public.products
for delete using (auth.uid() = owner_id);
```

## Vercel

- Root Directory: `shop`
- Build Command: `npm run build`
- Output Directory: `dist`
- Variables:
  - `REACT_APP_SUPABASE_URL`
  - `REACT_APP_SUPABASE_ANON_KEY`
  - `REACT_APP_ENABLE_API_MOCKS=false`
