create table public.onboarding_checklists (
  job_role text primary key check (job_role in ('Frontend Developer','Backend Developer','Designer','Business Analyst','HR')),
  revision integer not null check (revision > 0),
  tasks jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.onboarding_checklists enable row level security;
revoke all on public.onboarding_checklists from anon, authenticated;
grant select,insert,update on public.onboarding_checklists to authenticated;
grant all on public.onboarding_checklists to service_role;
create policy checklist_read on public.onboarding_checklists for select to authenticated using ((select auth.uid()) is not null);
create policy checklist_insert on public.onboarding_checklists for insert to authenticated with check ((select auth.jwt()->'app_metadata'->>'role')='admin');
create policy checklist_update on public.onboarding_checklists for update to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='admin') with check ((select auth.jwt()->'app_metadata'->>'role')='admin');

-- Validate every data-boundary write, including direct PostgREST updates. New task
-- identities are minted here; retained identities must exist in the prior snapshot.
create function public.validate_checklist_snapshot() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare item jsonb; result jsonb := '[]'; ids text[] := '{}'; identity text; n integer := 0; previous jsonb := '[]';
begin
  if tg_op = 'UPDATE' then
    if new.job_role <> old.job_role or new.revision <> old.revision + 1 then
      raise sqlstate 'PT409' using message='Checklist changed. Reload before saving.';
    end if;
    previous := old.tasks;
  elsif new.revision <> 1 then
    raise sqlstate 'PT400' using message='A new checklist starts at revision one.';
  end if;
  if jsonb_typeof(new.tasks) is distinct from 'array' or octet_length(new.tasks::text)>262144 then
    raise sqlstate 'PT400' using message='Invalid checklist tasks.';
  end if;
  if jsonb_array_length(new.tasks)>40 then raise sqlstate 'PT400' using message='Use at most 40 tasks.'; end if;
  for item in select value from jsonb_array_elements(new.tasks) loop
    if jsonb_typeof(item) is distinct from 'object'
       or jsonb_typeof(item->'title') is distinct from 'string'
       or char_length(btrim(item->>'title')) not between 1 and 120
       or (item->>'title') !~ '[^[:space:]]'
       or coalesce(item->>'stage','') not in ('Before you start','Day 1','Week 1')
       or jsonb_typeof(item->'instructions') is distinct from 'string'
       or char_length(item->>'instructions')>2000
       or (item->'guideId' is not null and item->'guideId'<>'null'::jsonb)
       or (item->'suggestedQuestion' is not null and item->'suggestedQuestion'<>'null'::jsonb)
       or (item - array['id','title','stage','instructions','position','guideId','suggestedQuestion']) <> '{}'::jsonb
       or (item ? 'position' and item->'position' <> to_jsonb(n)) then
      raise sqlstate 'PT400' using message='Check task title, stage, instructions and position.';
    end if;
    identity := item->>'id';
    if identity is null then identity := gen_random_uuid()::text;
    elsif not exists (select 1 from jsonb_array_elements(previous) p where p->>'id'=identity) then
      raise sqlstate 'PT400' using message='Unknown task identity. Add new tasks without an identity.';
    end if;
    if identity = any(ids) then raise sqlstate 'PT400' using message='Duplicate task identity.'; end if;
    ids := array_append(ids,identity);
    result := result || jsonb_build_array(jsonb_build_object('id',identity,'title',btrim(item->>'title'),'stage',item->>'stage','instructions',item->>'instructions','position',n,'guideId',null,'suggestedQuestion',null));
    n := n + 1;
  end loop;
  new.tasks := result;
  new.updated_at := now();
  return new;
end; $$;
revoke all on function public.validate_checklist_snapshot() from public,anon,authenticated;
create trigger validate_checklist before insert or update on public.onboarding_checklists for each row execute function public.validate_checklist_snapshot();

create function public.save_onboarding_checklist(p_job_role text,p_expected_revision integer,p_tasks jsonb,p_seed boolean default false)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare current_row public.onboarding_checklists; result public.onboarding_checklists;
begin
  if auth.uid() is null or coalesce(auth.jwt()->'app_metadata'->>'role','')<>'admin' then
    raise insufficient_privilege using message='Administrator access is required.';
  end if;
  if p_job_role is null or p_job_role not in ('Frontend Developer','Backend Developer','Designer','Business Analyst','HR') or p_expected_revision is null or p_expected_revision<0 or p_seed is null then
    raise sqlstate 'PT400' using message='Choose a supported role and saved revision.';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('firstday-checklist:' || p_job_role,0));
  select * into current_row from public.onboarding_checklists where job_role=p_job_role for update;
  if p_seed and p_job_role<>'Frontend Developer' then raise sqlstate 'PT400' using message='Starter tasks are available only for Frontend Developer.'; end if;
  if p_seed and current_row.job_role is not null then return to_jsonb(current_row); end if;
  if coalesce(current_row.revision,0)<>p_expected_revision then raise sqlstate 'PT409' using message='Checklist changed. Reload before saving.'; end if;
  if current_row.job_role is null then
    insert into public.onboarding_checklists(job_role,revision,tasks) values(p_job_role,1,p_tasks) returning * into result;
  else
    update public.onboarding_checklists set revision=revision+1,tasks=p_tasks where job_role=p_job_role returning * into result;
  end if;
  return to_jsonb(result);
end; $$;
revoke all on function public.save_onboarding_checklist(text,integer,jsonb,boolean) from public,anon;
grant execute on function public.save_onboarding_checklist(text,integer,jsonb,boolean) to authenticated;
