-- Phase 2: Agent (Rupa) — RAG search function + cross-channel lookup indexes.
-- Paste into the Supabase SQL Editor and run, same as 0001_init_schema.sql.

-- The Supabase JS client can't express the pgvector `<=>` distance operator
-- directly, so product_kb similarity search goes through this RPC function
-- instead (standard Supabase + pgvector pattern). Always scoped by
-- business_id — one business's knowledge never leaks into another's search.
create or replace function match_product_kb(
  p_business_id uuid,
  query_embedding vector(1536),
  match_count int default 4
)
returns table (
  id uuid,
  business_id uuid,
  content text,
  distance float
)
language sql stable
as $$
  select
    id,
    business_id,
    content,
    embedding <=> query_embedding as distance
  from product_kb
  where business_id = p_business_id
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Inbound Messenger/WhatsApp events look customers up by channel id; index
-- these so memory lookup on every message doesn't full-scan the table.
create index on customers (business_id, fb_psid);
create index on customers (business_id, wa_id);
