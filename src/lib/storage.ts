import { supabase } from './supabase';

const BUCKET = 'documents';

type UploadDocumentFileArgs = {
  businessId: string;
  truckId: string | null;
  documentId: string;
  uri: string;
  fileName: string;
  mimeType: string | null;
};

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function uploadDocumentFile({
  businessId,
  truckId,
  documentId,
  uri,
  fileName,
  mimeType,
}: UploadDocumentFileArgs): Promise<{ path: string | null; error: Error | null }> {
  const bucketFolder = truckId ?? 'general';
  const safeName = sanitizeFileName(fileName || 'attachment');
  const path = `${businessId}/${bucketFolder}/${documentId}/${Date.now()}_${safeName}`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    upsert: false,
    contentType: mimeType ?? undefined,
  });

  if (error) {
    return { path: null, error: new Error(error.message) };
  }
  return { path, error: null };
}

export async function getDocumentSignedUrl(filePath: string): Promise<{ url: string | null; error: Error | null }> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, 60 * 10);
  if (error) {
    return { url: null, error: new Error(error.message) };
  }
  return { url: data?.signedUrl ?? null, error: null };
}

export async function deleteDocumentFile(filePath: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
  if (error) {
    return { error: new Error(error.message) };
  }
  return { error: null };
}
