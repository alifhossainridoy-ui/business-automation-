-- Phase 4: Health, multi-business, hardening — error log backing the
-- Health page's "Recent errors" feed and the Telegram alert audit trail.
-- Paste into the Supabase SQL Editor and run, same as 0001-0003.

create table error_log (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid references businesses(id),
  source       text not null,
  message      text not null,
  created_at   timestamptz default now()
);

create index on error_log (business_id);
create index on error_log (created_at);
