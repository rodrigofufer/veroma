-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text not null,
  email text not null,
  country text not null,
  created_at timestamp with time zone default now() not null
);

-- Create ideas table
create table if not exists public.ideas (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  type text not null check (type in ('complaint', 'proposal', 'vote')),
  location text not null,
  country text not null,
  created_at timestamp with time zone default now() not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  upvotes integer default 0 not null,
  downvotes integer default 0 not null
);

-- Create votes table
create table if not exists public.votes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  idea_id uuid references public.ideas(id) on delete cascade not null,
  vote_type text not null check (vote_type in ('up', 'down')),
  created_at timestamp with time zone default now() not null,
  unique (user_id, idea_id)
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.votes enable row level security;

-- Profiles policies
create policy "Profiles are viewable by everyone"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- Ideas policies
create policy "Ideas are viewable by everyone"
  on ideas for select
  to authenticated
  using (true);

create policy "Users can insert their own ideas"
  on ideas for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own ideas"
  on ideas for update
  to authenticated
  using (auth.uid() = user_id);

-- Votes policies
create policy "Votes are viewable by everyone"
  on votes for select
  to authenticated
  using (true);

create policy "Users can insert their own votes"
  on votes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own votes"
  on votes for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own votes"
  on votes for delete
  to authenticated
  using (auth.uid() = user_id);

-- Create vote management functions
create or replace function increment_vote(idea_id uuid, vote_type text)
returns void
language plpgsql
security definer
as $$
begin
  if vote_type = 'upvotes' then
    update ideas set upvotes = upvotes + 1 where id = idea_id;
  elsif vote_type = 'downvotes' then
    update ideas set downvotes = downvotes + 1 where id = idea_id;
  end if;
end;
$$;

create or replace function decrement_vote(idea_id uuid, vote_type text)
returns void
language plpgsql
security definer
as $$
begin
  if vote_type = 'upvotes' then
    update ideas set upvotes = greatest(0, upvotes - 1) where id = idea_id;
  elsif vote_type = 'downvotes' then
    update ideas set downvotes = greatest(0, downvotes - 1) where id = idea_id;
  end if;
end;
$$;