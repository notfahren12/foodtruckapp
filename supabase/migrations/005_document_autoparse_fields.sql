-- Document auto-parse v1: link extracted territory to jurisdictions reference.
-- Safe to re-run.

alter table public.documents
  add column if not exists jurisdiction_id uuid references public.jurisdictions (id) on delete set null;

create index if not exists idx_documents_jurisdiction_id on public.documents (jurisdiction_id);
