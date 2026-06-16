-- RupZone Automation System — initial schema (blueprint section 04)
-- Every table is scoped by business_id. All queries must filter by it.

create extension if not exists pgcrypto;
create extension if not exists vector;

-- One row per business (RupZone, RupLota, future clients).
-- Tokens are entered via the dashboard, never hardcoded in app code.
create table businesses (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  fb_page_id    text,
  fb_page_token text,
  wa_phone_id   text,
  wa_token      text,
  ai_model      text default 'moonshotai/kimi-k2',
  -- Not in blueprint section 04's SQL, but required by build-brief rule #2
  -- ("No hardcoded secrets" lists OpenRouter alongside Facebook/WhatsApp as
  -- tokens that must live in this table, entered via the dashboard).
  openrouter_api_key text,
  persona       text,
  created_at    timestamptz default now()
);

-- One customer = one row. Channels linked by phone (cross-channel memory).
create table customers (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid references businesses(id) not null,
  phone        text,
  fb_psid      text,
  wa_id        text,
  name         text,
  tags         text[],
  source       text,
  created_at   timestamptz default now(),
  unique (business_id, phone)
);

-- All channel conversation history, tagged by channel.
create table conversations (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid references businesses(id) not null,
  customer_id  uuid references customers(id),
  channel      text,
  role         text,
  message      text,
  meta         jsonb,
  created_at   timestamptz default now()
);

-- Lead + order status.
create table leads (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid references businesses(id) not null,
  customer_id  uuid references customers(id),
  status       text default 'new',
  product      text,
  amount       numeric,
  note         text,
  updated_at   timestamptz default now()
);

-- Comment moderation audit log.
create table comment_log (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid references businesses(id) not null,
  comment_id   text,
  author       text,
  text         text,
  category     text,
  action       text,
  created_at   timestamptz default now()
);

-- Bulk WhatsApp template campaigns.
create table campaigns (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid references businesses(id) not null,
  name         text,
  template     text,
  total        int,
  sent         int default 0,
  replied      int default 0,
  status       text default 'draft',
  created_at   timestamptz default now()
);

-- Product knowledge base for RAG.
create table product_kb (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid references businesses(id) not null,
  content      text,
  embedding    vector(1536)
);

-- Manually maintained competitor/abuser blocklist — instant hide.
create table blocklist (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid references businesses(id) not null,
  fb_user_id   text,
  name         text,
  reason       text
);

-- Chat-to-correct queue: wrong agent answers, owner-supplied corrections,
-- applied into product_kb on demand.
create table corrections (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid references businesses(id) not null,
  question     text,
  wrong_answer text,
  right_answer text,
  applied      boolean default false,
  created_at   timestamptz default now()
);

create index on customers (business_id);
create index on conversations (business_id, customer_id);
create index on leads (business_id);
create index on comment_log (business_id);
create index on campaigns (business_id);
create index on product_kb (business_id);
create index on blocklist (business_id);
create index on corrections (business_id);
