-- Backup and remove custom user tables to use standard Supabase Auth
create table if not exists public.users_backup as table public.users;
drop table if exists public.users;
create table if not exists public.verification_codes_backup as table public.verification_codes;
drop table if exists public.verification_codes;
