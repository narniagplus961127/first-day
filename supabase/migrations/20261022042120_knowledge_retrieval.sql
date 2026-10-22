create function public.search_knowledge(p_embedding extensions.vector(768), p_config text, p_role text default null)
returns table(id uuid,version_id uuid,document_id uuid,title text,job_role text,heading text,start_line integer,end_line integer,content text,similarity double precision)
language sql stable security invoker set search_path='' as $$
 select c.id,c.version_id,d.id,d.title,d.job_role,c.heading,c.start_line,c.end_line,c.content,
  1-(c.embedding operator(extensions.<=>) p_embedding) as similarity
 from public.knowledge_chunks c
 join public.knowledge_versions v on v.id=c.version_id
 join public.knowledge_documents d on d.id=v.document_id and d.active_version_id=v.id
 where v.status='ready' and v.published_at is not null and v.embedding_config=p_config
  and c.embedding_config=p_config and c.embedding is not null
  and (p_role is null or d.job_role=p_role)
  and 1-(c.embedding operator(extensions.<=>) p_embedding)>=0.35
 order by c.embedding operator(extensions.<=>) p_embedding,c.id
 limit 6;
$$;
revoke all on function public.search_knowledge(extensions.vector,text,text) from public,anon;
grant execute on function public.search_knowledge(extensions.vector,text,text) to authenticated;
