-- Creates the key-value store table used by the Edge Function
create table if not exists kv_store_f04930f2 (
  key text primary key,
  value jsonb not null
);
