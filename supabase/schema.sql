create extension if not exists "pgcrypto";

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  transaction_id text not null,
  decision text not null check (decision in ('APPROVE', 'HOLD', 'ESCALATE', 'VERIFY')),
  risk_score integer not null check (risk_score between 0 and 100),
  confidence integer not null check (confidence between 0 and 100),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists analyses_created_at_idx on analyses (created_at desc);
create index if not exists analyses_transaction_id_idx on analyses (transaction_id);
