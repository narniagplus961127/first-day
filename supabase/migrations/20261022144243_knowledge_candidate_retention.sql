create or replace function public.replace_knowledge_document(p_document uuid,p_filename text,p_content text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare d public.knowledge_documents; v public.knowledge_versions; live_count integer;
begin
 if (select auth.jwt()->'app_metadata'->>'role') is distinct from 'admin' then raise insufficient_privilege using message='Administrator required'; end if;
 select * into d from public.knowledge_documents where id=p_document for update;
 if not found then raise no_data_found using message='Guide not found'; end if;
 select count(*) into live_count from public.knowledge_versions where document_id=d.id and published_at is null and index_lease_until>now();
 if live_count>=3 then raise serialization_failure using message='Three indexing attempts are still in progress. Wait and retry.'; end if;
 delete from public.knowledge_versions where document_id=d.id and published_at is null and (index_lease_until is null or index_lease_until<=now()) and id not in
  (select id from public.knowledge_versions where document_id=d.id and published_at is null and (index_lease_until is null or index_lease_until<=now()) order by revision desc limit (2-live_count));
 insert into public.knowledge_versions(document_id,filename,content) values (d.id,p_filename,p_content) returning * into v;
 return jsonb_build_object('document',to_jsonb(d),'version',to_jsonb(v));
end $$;
