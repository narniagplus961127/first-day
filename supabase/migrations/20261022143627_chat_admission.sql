create table public.demo_chat_days (
 day date primary key,
 used integer not null default 0 check (used between 0 and 100)
);
create table public.demo_chat_ips (
 identity text primary key check (identity ~ '^[0-9a-f]{64}$'),
 admitted_at timestamptz[] not null default '{}',
 seen_at timestamptz not null
);
alter table public.demo_chat_days enable row level security;
alter table public.demo_chat_ips enable row level security;
revoke all on public.demo_chat_days,public.demo_chat_ips from public,anon,authenticated;
grant all on public.demo_chat_days,public.demo_chat_ips to service_role;
create function public.admit_demo_question(p_identity text,p_now timestamptz default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 instant timestamptz := coalesce(p_now,clock_timestamp());
 utc_day date := (instant at time zone 'UTC')::date;
 daily_used integer;
 recent timestamptz[];
 reset_at timestamptz;
begin
 if p_identity is null or p_identity !~ '^[0-9a-f]{64}$' then raise exception 'Invalid request identity'; end if;
 -- One transaction lock serializes admission across every function instance.
 perform pg_catalog.pg_advisory_xact_lock(7266123);
 delete from public.demo_chat_days where day < utc_day-7;
 delete from public.demo_chat_ips where seen_at < instant-interval '7 days';
 insert into public.demo_chat_days(day) values(utc_day) on conflict do nothing;
 select used into daily_used from public.demo_chat_days where day=utc_day for update;
 if daily_used>=100 then
  reset_at := (utc_day+1)::timestamp at time zone 'UTC';
  return jsonb_build_object('allowed',false,'code','app_daily','retryAfterSeconds',ceil(extract(epoch from reset_at-instant))::integer,'retryAt',reset_at);
 end if;
 insert into public.demo_chat_ips(identity,seen_at) values(p_identity,instant) on conflict do nothing;
 select coalesce(array_agg(t order by t),'{}') into recent from public.demo_chat_ips i,
 lateral unnest(i.admitted_at) t where i.identity=p_identity and t>instant-interval '60 seconds';
 if cardinality(recent)>=5 then
  reset_at := recent[1]+interval '60 seconds';
  return jsonb_build_object('allowed',false,'code','app_minute','retryAfterSeconds',greatest(1,ceil(extract(epoch from reset_at-instant))::integer),'retryAt',reset_at);
 end if;
 update public.demo_chat_ips set admitted_at=array_append(recent,instant),seen_at=instant where identity=p_identity;
 update public.demo_chat_days set used=used+1 where day=utc_day;
 return jsonb_build_object('allowed',true);
end $$;
revoke all on function public.admit_demo_question(text,timestamptz) from public,anon,authenticated;
grant execute on function public.admit_demo_question(text,timestamptz) to service_role;
