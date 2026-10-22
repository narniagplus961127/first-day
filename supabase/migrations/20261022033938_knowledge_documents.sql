create table public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  job_role text not null check (job_role in ('Frontend Developer','Backend Developer','Designer','Business Analyst','HR')),
  created_by uuid not null references auth.users(id),
  active_version_id uuid,
  created_at timestamptz not null default now()
);

create table public.knowledge_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.knowledge_documents(id) on delete cascade,
  filename text not null check (char_length(filename) between 1 and 255),
  content text not null check (octet_length(content) between 1 and 102400),
  status text not null default 'pending' check (status in ('pending','processing','ready','failed')),
  created_at timestamptz not null default now(),
  unique (document_id,id)
);
alter table public.knowledge_documents add constraint knowledge_documents_active_version_fkey
  foreign key (id,active_version_id) references public.knowledge_versions(document_id,id);
create index knowledge_documents_created_by_idx on public.knowledge_documents(created_by);
create index knowledge_versions_document_id_idx on public.knowledge_versions(document_id);

alter table public.knowledge_documents enable row level security;
alter table public.knowledge_versions enable row level security;
revoke all on public.knowledge_documents, public.knowledge_versions from anon, authenticated;
grant select, insert, update, delete on public.knowledge_documents, public.knowledge_versions to authenticated;
grant all on public.knowledge_documents, public.knowledge_versions to service_role;

create policy administrator_documents on public.knowledge_documents for all to authenticated
  using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
  with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy administrator_versions on public.knowledge_versions for all to authenticated
  using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
  with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create function public.create_knowledge_document(p_title text,p_job_role text,p_filename text,p_content text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_document public.knowledge_documents;
  v_version public.knowledge_versions;
begin
  if coalesce(auth.jwt()->'app_metadata'->>'role','') <> 'admin' then
    raise insufficient_privilege using message = 'Administrator access is required.';
  end if;
  insert into public.knowledge_documents(title,job_role,created_by)
    values (btrim(p_title),p_job_role,auth.uid()) returning * into v_document;
  insert into public.knowledge_versions(document_id,filename,content)
    values (v_document.id,p_filename,p_content) returning * into v_version;
  return jsonb_build_object('document',to_jsonb(v_document),'version',to_jsonb(v_version));
end;
$$;
revoke all on function public.create_knowledge_document(text,text,text,text) from public, anon;
grant execute on function public.create_knowledge_document(text,text,text,text) to authenticated, service_role;