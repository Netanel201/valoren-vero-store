-- VALOREN VERO store setup for Supabase
-- Run this whole file in Supabase Dashboard > SQL Editor.
-- Then create your own user in Authentication > Users (Add user).
-- Copy that user's UUID and replace YOUR_AUTH_USER_UUID below, then run the INSERT statement separately.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  category text not null,
  image_url text,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  stock_default integer not null default 0 check (stock_default >= 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.products enable row level security;

create or replace function public.is_store_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_store_admin() from public;
grant execute on function public.is_store_admin() to authenticated, anon;

drop policy if exists "Admins can read admin list" on public.admin_users;
create policy "Admins can read admin list" on public.admin_users
for select to authenticated using (public.is_store_admin());

drop policy if exists "Public can view published products" on public.products;
create policy "Public can view published products" on public.products
for select to anon, authenticated using (is_published = true or public.is_store_admin());

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products" on public.products
for insert to authenticated with check (public.is_store_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products" on public.products
for update to authenticated using (public.is_store_admin()) with check (public.is_store_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products
for delete to authenticated using (public.is_store_admin());

-- Create a public bucket for product images. Anyone can view product images;
-- only the admin user can upload, update or delete files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images" on storage.objects
for select to public using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects
for insert to authenticated with check (bucket_id = 'product-images' and public.is_store_admin());

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects
for update to authenticated using (bucket_id = 'product-images' and public.is_store_admin())
with check (bucket_id = 'product-images' and public.is_store_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects
for delete to authenticated using (bucket_id = 'product-images' and public.is_store_admin());

-- After creating your user in Authentication > Users, run this with its UUID:
-- insert into public.admin_users (user_id) values ('YOUR_AUTH_USER_UUID');
