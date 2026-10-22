alter table public.knowledge_versions add column revision bigint generated always as identity;
create unique index knowledge_versions_revision_idx on public.knowledge_versions(document_id,revision);

create function public.replace_knowledge_document(p_document uuid,p_filename text,p_content text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare d public.knowledge_documents; v public.knowledge_versions;
begin
 if (select auth.jwt()->'app_metadata'->>'role') is distinct from 'admin' then raise insufficient_privilege using message='Administrator required'; end if;
 select * into d from public.knowledge_documents where id=p_document for update;
 if not found then raise no_data_found using message='Guide not found'; end if;
 insert into public.knowledge_versions(document_id,filename,content) values (d.id,p_filename,p_content) returning * into v;
 return jsonb_build_object('document',to_jsonb(d),'version',to_jsonb(v));
end $$;
revoke all on function public.replace_knowledge_document(uuid,text,text) from public,anon;
grant execute on function public.replace_knowledge_document(uuid,text,text) to authenticated;

create or replace function public.claim_knowledge_index(p_version uuid,p_config text) returns uuid language plpgsql security invoker set search_path='' as $$
declare token uuid:=gen_random_uuid(); v public.knowledge_versions;
begin
 if (select auth.jwt()->'app_metadata'->>'role') is distinct from 'admin' then raise insufficient_privilege using message='Administrator required'; end if;
 select * into v from public.knowledge_versions where id=p_version;
 if not found then raise no_data_found using message='Candidate unavailable'; end if;
 perform 1 from public.knowledge_documents where id=v.document_id for update;
 select * into v from public.knowledge_versions where id=p_version for update;
 if exists(select 1 from public.knowledge_versions where document_id=v.document_id and revision>v.revision) then
  raise serialization_failure using message='A newer candidate exists. Reload this guide.';
 end if;
 if v.embedding_config is not null and v.embedding_config<>p_config and v.published_at is null and (v.index_lease_until is null or v.index_lease_until<now()) then
  delete from public.knowledge_chunks where version_id=p_version;
 end if;
 update public.knowledge_versions set index_token=token,index_lease_until=now()+interval '60 seconds',status='processing',index_error=null,embedding_config=p_config
 where id=p_version and published_at is null and (index_lease_until is null or index_lease_until<now());
 if not found then return null; end if;
 return token;
end $$;

create or replace function public.publish_knowledge_version(p_version uuid,p_token uuid) returns boolean language plpgsql security invoker set search_path='' as $$
declare v public.knowledge_versions;
begin
 if (select auth.jwt()->'app_metadata'->>'role') is distinct from 'admin' then raise insufficient_privilege using message='Administrator required'; end if;
 select * into v from public.knowledge_versions where id=p_version;
 if not found then raise no_data_found using message='Candidate unavailable'; end if;
 perform 1 from public.knowledge_documents where id=v.document_id for update;
 select * into v from public.knowledge_versions where id=p_version for update;
 if exists(select 1 from public.knowledge_versions where document_id=v.document_id and revision>v.revision) then
  raise serialization_failure using message='A newer candidate exists. Reload this guide.';
 end if;
 if v.index_token is distinct from p_token or v.chunk_count=0 then return false; end if;
 if (select count(*) from public.knowledge_chunks where version_id=p_version and embedding is not null and embedding_config=v.embedding_config)<>v.chunk_count then return false; end if;
 update public.knowledge_versions set status='ready',published_at=now(),index_token=null,index_lease_until=null,index_error=null where id=p_version;
 update public.knowledge_documents set active_version_id=p_version where id=v.document_id;
 delete from public.knowledge_versions where document_id=v.document_id and published_at is not null and id in
  (select id from public.knowledge_versions where document_id=v.document_id and published_at is not null order by revision desc offset 3);
 return true;
end $$;
