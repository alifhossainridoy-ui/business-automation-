-- Phase 3: Bulk + Leads — link leads to the campaign that targeted them,
-- and track per-campaign failures alongside sent/replied.
-- Paste into the Supabase SQL Editor and run, same as 0001/0002.

alter table leads add column campaign_id uuid references campaigns(id);
alter table campaigns add column failed int default 0;

create index on leads (campaign_id);
