-- OCR metadata fields for document auto-populate v1.
-- Safe to re-run in Supabase SQL editor.

alter table public.documents
  add column if not exists extracted_text text,
  add column if not exists extracted_confidence numeric,
  add column if not exists auto_detected boolean not null default false,
  add column if not exists permit_number text,
  add column if not exists issued_date date;

create index if not exists idx_documents_auto_detected on public.documents(auto_detected);
