create extension if not exists vector with schema extensions;
alter table public.knowledge_versions
 add column published_at timestamptz,
 add column embedding_config text,
 add column chunk_count integer not null default 0,
 add column index_token uuid,
 add column index_lease_until timestamptz,
 add column index_error text;
create table public.knowledge_chunks (
 id uuid primary key default gen_random_uuid(),
 version_id uuid not null references public.knowledge_versions(id) on delete cascade,
 ordinal integer not null check(ordinal >= 0),
 heading text not null,
 start_line integer not null check(start_line>0),
 end_line integer not null check(end_line>=start_line),
 content text not null,
 embedding extensions.vector(768),
 embedding_config text not null,
 unique(version_id,ordinal)
);
alter table public.knowledge_chunks enable row level security;
revoke all on public.knowledge_chunks from anon;
grant select,insert,update,delete on public.knowledge_chunks to authenticated;
grant all on public.knowledge_chunks to service_role;
create policy chunks_admin on public.knowledge_chunks for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='admin') with check ((select auth.jwt()->'app_metadata'->>'role')='admin');
create policy published_documents on public.knowledge_documents for select to authenticated using (active_version_id is not null);
create policy published_versions on public.knowledge_versions for select to authenticated using (published_at is not null and status='ready');
create policy published_chunks on public.knowledge_chunks for select to authenticated using (exists(select 1 from public.knowledge_versions v where v.id=version_id and v.published_at is not null and v.status='ready'));
create function public.claim_knowledge_index(p_version uuid,p_config text) returns uuid language plpgsql security invoker set search_path='' as $$
declare token uuid:=gen_random_uuid();
begin
 if (select auth.jwt()->'app_metadata'->>'role') is distinct from 'admin' then raise exception 'Administrator required'; end if;
 perform 1 from public.knowledge_versions where id=p_version for update;
 if exists(select 1 from public.knowledge_versions where id=p_version and embedding_config is not null and embedding_config<>p_config and published_at is null and (index_lease_until is null or index_lease_until<now())) then
  delete from public.knowledge_chunks where version_id=p_version;
 end if;
 update public.knowledge_versions set index_token=token,index_lease_until=now()+interval '60 seconds',status='processing',index_error=null,embedding_config=p_config
 where id=p_version and published_at is null and (index_lease_until is null or index_lease_until<now());
 if not found then return null; end if;
 return token;
end $$;
create function public.publish_knowledge_version(p_version uuid,p_token uuid) returns boolean language plpgsql security invoker set search_path='' as $$
declare v public.knowledge_versions;
begin
 if (select auth.jwt()->'app_metadata'->>'role') is distinct from 'admin' then raise exception 'Administrator required'; end if;
 select * into v from public.knowledge_versions where id=p_version for update;
 if v.index_token is distinct from p_token or v.chunk_count=0 then return false; end if;
 if (select count(*) from public.knowledge_chunks where version_id=p_version and embedding is not null and embedding_config=v.embedding_config) <> v.chunk_count then return false; end if;
 update public.knowledge_versions set status='ready',published_at=now(),index_token=null,index_lease_until=null,index_error=null where id=p_version;
 update public.knowledge_documents set active_version_id=p_version where id=v.document_id and active_version_id is null;
 if not found then raise exception 'A published version already exists'; end if;
 return true;
end $$;
revoke all on function public.claim_knowledge_index(uuid,text),public.publish_knowledge_version(uuid,uuid) from public,anon;
grant execute on function public.claim_knowledge_index(uuid,text),public.publish_knowledge_version(uuid,uuid) to authenticated,service_role;
