-- Create support_requests table
create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'answered', 'closed', 'timeout')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_agent_reply_at timestamptz
);

-- Create support_messages table
create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.support_requests(id) on delete cascade,
  author_type text not null check (author_type in ('user', 'agent', 'bot')),
  body text not null,
  created_at timestamptz not null default now()
);

-- Create indexes for better query performance
create index if not exists idx_support_requests_status on public.support_requests(status);
create index if not exists idx_support_requests_created_at on public.support_requests(created_at desc);
create index if not exists idx_support_requests_email on public.support_requests(email);
create index if not exists idx_support_messages_request_id on public.support_messages(request_id);
create index if not exists idx_support_messages_created_at on public.support_messages(created_at desc);

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for support_requests
create trigger set_updated_at
  before update on public.support_requests
  for each row
  execute function public.handle_updated_at();

-- Enable Row Level Security (RLS)
alter table public.support_requests enable row level security;
alter table public.support_messages enable row level security;

-- RLS Policies: Allow all operations for now (adjust based on auth requirements)
-- For public access (no auth required):
create policy "Allow public read access to support_requests"
  on public.support_requests for select
  using (true);

create policy "Allow public insert to support_requests"
  on public.support_requests for insert
  with check (true);

create policy "Allow public read access to support_messages"
  on public.support_messages for select
  using (true);

create policy "Allow public insert to support_messages"
  on public.support_messages for insert
  with check (true);

-- For agents/admins (authenticated users can update):
create policy "Allow authenticated update to support_requests"
  on public.support_requests for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Allow authenticated insert to support_messages"
  on public.support_messages for insert
  with check (auth.role() = 'authenticated');

-- Comments for documentation
comment on table public.support_requests is 'Customer support ticket requests';
comment on table public.support_messages is 'Messages in support ticket conversations';
comment on column public.support_requests.status is 'Ticket status: open, answered, closed, timeout';
comment on column public.support_messages.author_type is 'Message author: user, agent, or bot';
