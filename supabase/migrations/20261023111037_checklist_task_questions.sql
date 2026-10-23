-- Preserve guide and stable identity validation while supporting bounded plain-text questions.
create or replace function public.validate_checklist_snapshot() returns trigger
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
       or (item->>'suggestedQuestion' is not null and (jsonb_typeof(item->'suggestedQuestion') is distinct from 'string' or char_length(item->>'suggestedQuestion')>1000))
       or (item - array['id','title','stage','instructions','position','guideId','suggestedQuestion']) <> '{}'::jsonb
       or (item ? 'position' and item->'position' <> to_jsonb(n)) then
      raise sqlstate 'PT400' using message='Check task title, stage, instructions and position.';
    end if;
    if item->>'guideId' is not null then
      if jsonb_typeof(item->'guideId') is distinct from 'string' or (item->>'guideId') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
        raise sqlstate 'PT400' using message='Choose a published guide for this role.';
      end if;
      if not exists (
        select 1 from public.knowledge_documents d join public.knowledge_versions v on v.id=d.active_version_id and v.document_id=d.id
        where d.id=(item->>'guideId')::uuid and d.job_role=new.job_role and v.status='ready' and v.published_at is not null
      ) then raise sqlstate 'PT400' using message='Choose a published guide for this role. The selected guide is unavailable.'; end if;
    end if;
    identity := item->>'id';
    if identity is null then identity := gen_random_uuid()::text;
    elsif not exists (select 1 from jsonb_array_elements(previous) p where p->>'id'=identity) then
      raise sqlstate 'PT400' using message='Unknown task identity. Add new tasks without an identity.';
    end if;
    if identity = any(ids) then raise sqlstate 'PT400' using message='Duplicate task identity.'; end if;
    ids := array_append(ids,identity);
    result := result || jsonb_build_array(jsonb_build_object('id',identity,'title',btrim(item->>'title'),'stage',item->>'stage','instructions',item->>'instructions','position',n,'guideId',(item->>'guideId')::uuid,'suggestedQuestion',nullif(btrim(item->>'suggestedQuestion'),'')));
    n := n + 1;
  end loop;
  new.tasks := result;
  new.updated_at := now();
  return new;
end; $$;
revoke all on function public.validate_checklist_snapshot() from public,anon,authenticated;
