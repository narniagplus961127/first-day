alter table public.knowledge_documents add column sample_key text unique
  check (sample_key is null or sample_key in ('lumen.frontend-onboarding.v1','lumen.backend-onboarding.v1','lumen.designer-onboarding.v1','lumen.business-analyst-onboarding.v1','lumen.hr-onboarding.v1'));

-- Keep the ordinary upload RPC intact. Samples use the same transaction and
-- indexing path, with an explicit identity that never replaces existing content.
create function public.create_sample_knowledge_document(p_title text,p_job_role text,p_filename text,p_content text,p_sample_key text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_document public.knowledge_documents;
  v_version public.knowledge_versions;
begin
  if coalesce(auth.jwt()->'app_metadata'->>'role','') <> 'admin' then
    raise insufficient_privilege using message = 'Administrator access is required.';
  end if;
  if p_sample_key is null or not (
    (p_sample_key = 'lumen.frontend-onboarding.v1' and p_job_role = 'Frontend Developer') or
    (p_sample_key = 'lumen.backend-onboarding.v1' and p_job_role = 'Backend Developer') or
    (p_sample_key = 'lumen.designer-onboarding.v1' and p_job_role = 'Designer') or
    (p_sample_key = 'lumen.business-analyst-onboarding.v1' and p_job_role = 'Business Analyst') or
    (p_sample_key = 'lumen.hr-onboarding.v1' and p_job_role = 'HR')
  ) then raise sqlstate 'PT400' using message = 'Choose a matching sample identity and role.'; end if;
  -- Serialize first creation as well as retries. Unique constraint protects
  -- callers using the Data API directly; this lock spans both row inserts.
  perform pg_advisory_xact_lock(hashtextextended(p_sample_key, 0));
  select * into v_document from public.knowledge_documents where sample_key = p_sample_key;
  if found then
    if v_document.job_role <> p_job_role then
      raise sqlstate 'PT409' using message = 'The sample role was customized. Preserve it for review.';
    end if;
    select * into v_version from public.knowledge_versions where document_id = v_document.id order by revision desc limit 1;
    if not found then raise sqlstate 'PT409' using message = 'The sample has no candidate. Repair it explicitly.'; end if;
  else
    insert into public.knowledge_documents(title,job_role,created_by,sample_key)
      values (btrim(p_title),p_job_role,auth.uid(),p_sample_key) returning * into v_document;
    insert into public.knowledge_versions(document_id,filename,content)
      values (v_document.id,p_filename,p_content) returning * into v_version;
  end if;
  return jsonb_build_object('document',to_jsonb(v_document),'version',to_jsonb(v_version));
end;
$$;
revoke all on function public.create_sample_knowledge_document(text,text,text,text,text) from public, anon;
grant execute on function public.create_sample_knowledge_document(text,text,text,text,text) to authenticated;
