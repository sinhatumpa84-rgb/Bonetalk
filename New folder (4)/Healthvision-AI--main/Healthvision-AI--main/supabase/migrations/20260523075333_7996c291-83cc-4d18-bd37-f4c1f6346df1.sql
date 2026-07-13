
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles selectable by owner" on public.profiles for select using (auth.uid() = id);
create policy "Profiles updatable by owner" on public.profiles for update using (auth.uid() = id);
create policy "Profiles insertable by owner" on public.profiles for insert with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Diagnoses (symptom checker + medical analysis results)
create table public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, -- 'symptom' | 'image' | 'report'
  title text,
  input_text text,
  result_json jsonb,
  confidence numeric,
  created_at timestamptz not null default now()
);
alter table public.diagnoses enable row level security;
create policy "Diagnoses by owner" on public.diagnoses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index on public.diagnoses (user_id, created_at desc);

-- Appointments
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  doctor_name text not null,
  specialty text,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now()
);
alter table public.appointments enable row level security;
create policy "Appointments by owner" on public.appointments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Chat messages
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null, -- 'user' | 'assistant'
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.chat_messages enable row level security;
create policy "Chat by owner" on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index on public.chat_messages (user_id, created_at);

-- Vitals
create table public.vitals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  heart_rate int,
  blood_pressure text,
  oxygen int,
  temperature numeric,
  recorded_at timestamptz not null default now()
);
alter table public.vitals enable row level security;
create policy "Vitals by owner" on public.vitals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
