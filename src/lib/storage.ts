import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { supabase } from './supabase';

/**
 * Expects a private Storage bucket. Files are opened via short-lived signed URLs only.
 * (Same pattern applies to truck photos when uploaded to a private bucket.)
 */
const BUCKET = 'documents';

/**
 * Reads a picked/captured file into raw bytes for upload.
 *
 * IMPORTANT: On React Native, `fetch(fileUri).blob()` returns a Blob that
 * `@supabase/supabase-js` uploads as **zero bytes** (the RN Blob does not expose
 * its data the way the storage client expects). That silently produced empty
 * uploads, which is why no files ever landed in the bucket. We read the actual
 * bytes instead:
 *   - native (iOS/Android): expo-file-system `File.bytes()` → Uint8Array
 *   - web: `fetch(...).arrayBuffer()` (blob:/data: URLs work correctly there)
 */
async function readFileBytes(uri: string): Promise<Uint8Array> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }
  return await new File(uri).bytes();
}

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

  let bytes: Uint8Array;
  try {
    bytes = await readFileBytes(uri);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { path: null, error: new Error(`Could not read the selected file (${msg}).`) };
  }

  if (!bytes || bytes.byteLength === 0) {
    return {
      path: null,
      error: new Error('The selected file is empty. Please pick or retake the file and try again.'),
    };
  }

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    upsert: false,
    contentType: mimeType ?? 'application/octet-stream',
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
