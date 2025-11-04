-- Create health_conditions table for tracking user medical conditions
-- This supports expanded DUR (Drug Utilization Review) functionality

create table if not exists public.health_conditions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  condition text not null,
  category text not null check (category in (
    'cardiovascular',
    'respiratory',
    'endocrine',
    'gastrointestinal',
    'renal',
    'hepatic',
    'neurological',
    'pregnancy',
    'other'
  )),
  diagnosed_date date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.health_conditions enable row level security;

-- Create RLS policies
-- Users can only view their own health conditions
create policy "Users can view own health conditions"
  on public.health_conditions
  for select
  using (auth.uid() = user_id);

-- Users can insert their own health conditions
create policy "Users can insert own health conditions"
  on public.health_conditions
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own health conditions
create policy "Users can update own health conditions"
  on public.health_conditions
  for update
  using (auth.uid() = user_id);

-- Users can delete their own health conditions
create policy "Users can delete own health conditions"
  on public.health_conditions
  for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists health_conditions_user_id_idx on public.health_conditions(user_id);

-- Create updated_at trigger
create or replace function public.handle_health_condition_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_health_condition_updated_at
  before update on public.health_conditions
  for each row
  execute function public.handle_health_condition_updated_at();
