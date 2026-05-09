/*
  Documents storage bucket + policies (private).
  Path convention:
    business_id/truck_id_or_general/document_id/filename
*/

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do update set public = excluded.public;

-- Remove old policies if they already exist (safe for re-runs in branch DBs).
drop policy if exists "documents_select_own_business" on storage.objects;
drop policy if exists "documents_insert_own_business" on storage.objects;
drop policy if exists "documents_update_own_business" on storage.objects;
drop policy if exists "documents_delete_own_business" on storage.objects;

-- Read objects only when first path segment (business_id) belongs to auth user.
create policy "documents_select_own_business"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'documents'
  and exists (
    select 1
    from public.businesses b
    where b.id::text = split_part(name, '/', 1)
      and b.owner_id = auth.uid()
  )
);

-- Upload only into your own business folder prefix.
create policy "documents_insert_own_business"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'documents'
  and split_part(name, '/', 1) <> ''
  and exists (
    select 1
    from public.businesses b
    where b.id::text = split_part(name, '/', 1)
      and b.owner_id = auth.uid()
  )
);

-- Move/replace only your business objects.
create policy "documents_update_own_business"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'documents'
  and exists (
    select 1
    from public.businesses b
    where b.id::text = split_part(name, '/', 1)
      and b.owner_id = auth.uid()
  )
)
with check (
  bucket_id = 'documents'
  and exists (
    select 1
    from public.businesses b
    where b.id::text = split_part(name, '/', 1)
      and b.owner_id = auth.uid()
  )
);

-- Delete only your business objects.
create policy "documents_delete_own_business"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'documents'
  and exists (
    select 1
    from public.businesses b
    where b.id::text = split_part(name, '/', 1)
      and b.owner_id = auth.uid()
  )
);
