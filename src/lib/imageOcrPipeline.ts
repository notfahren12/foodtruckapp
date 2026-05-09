import { File } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';

import type { OcrExtractResult } from './ocr';
import { extractTextFromImage } from './ocr';

const MAX_WIDTH = 1600;

export type SourceImageMeta = {
  uri: string;
  extension: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  fileSizeBytes: number | null;
};

export type PreprocessOutput = {
  uri: string;
  width: number | null;
  height: number | null;
  error: string | null;
};

export type FullImageOcrScanResult = {
  meta: SourceImageMeta;
  processedUri: string;
  preprocessError: string | null;
  processedWidth: number | null;
  processedHeight: number | null;
  ocr: OcrExtractResult;
};

function extensionFromUri(uri: string, fileName?: string | null): string | null {
  const name = fileName ?? uri.split('?')[0]?.split('/').pop() ?? '';
  const m = name.match(/\.([a-z0-9]+)$/i);
  return m?.[1] ? `.${m[1].toLowerCase()}` : null;
}

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (err) => reject(err),
    );
  });
}

export async function collectSourceImageMeta(
  uri: string,
  fileName?: string | null,
  mimeType?: string | null,
): Promise<SourceImageMeta> {
  let width: number | null = null;
  let height: number | null = null;
  let fileSizeBytes: number | null = null;

  try {
    const dim = await getImageSize(uri);
    width = dim.width;
    height = dim.height;
  } catch {
    /* optional — some URIs fail on certain platforms */
  }

  try {
    const file = new File(uri);
    if (file.exists && typeof file.size === 'number' && file.size > 0) {
      fileSizeBytes = file.size;
    }
  } catch {
    /* optional — content URIs may not support File metadata */
  }

  return {
    uri,
    extension: extensionFromUri(uri, fileName),
    mimeType: mimeType ?? null,
    width,
    height,
    fileSizeBytes,
  };
}

/**
 * Resize to max width 1600px (no upscaling), re-encode as JPEG at quality 1.0 for OCR.
 */
export async function preprocessImageForOcr(uri: string): Promise<PreprocessOutput> {
  try {
    const dim = await getImageSize(uri);
    const targetWidth = Math.min(dim.width, MAX_WIDTH);
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: targetWidth } }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
    );
    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      error: null,
    };
  } catch (firstError) {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: MAX_WIDTH } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
      );
      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        error: null,
      };
    } catch {
      const msg = firstError instanceof Error ? firstError.message : String(firstError);
      return { uri, width: null, height: null, error: msg };
    }
  }
}

/** Collect meta, preprocess for OCR, run on-device text extraction (no external APIs). */
export async function scanImageUriWithPreprocess(
  uri: string,
  fileName?: string | null,
  mimeType?: string | null,
): Promise<FullImageOcrScanResult> {
  const meta = await collectSourceImageMeta(uri, fileName, mimeType);
  const prep = await preprocessImageForOcr(uri);

  const useOriginal = Boolean(prep.error);
  const ocrUri = useOriginal ? uri : prep.uri;
  const preprocessError = prep.error;

  const ocr = await extractTextFromImage(ocrUri);

  return {
    meta,
    processedUri: ocrUri,
    preprocessError,
    processedWidth: useOriginal ? null : prep.width,
    processedHeight: useOriginal ? null : prep.height,
    ocr,
  };
}

/** Serializable snapshot for UI / debugging (no circular refs). */
export type OcrDiagnosticsSnapshot = {
  sourceUri: string;
  processedUri: string;
  extension: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  fileSizeBytes: number | null;
  processedWidth: number | null;
  processedHeight: number | null;
  preprocessError: string | null;
  libraryLineCount: number;
  /** First lines returned by expo-text-extractor (JSON). */
  libraryLinesSample: string;
  ocrTextLength: number;
  ocrThrownError: string | null;
  ocrUnsupported: boolean;
};

export function snapshotFromScan(full: FullImageOcrScanResult): OcrDiagnosticsSnapshot {
  const lines = full.ocr.rawLines;
  return {
    sourceUri: full.meta.uri,
    processedUri: full.processedUri,
    extension: full.meta.extension,
    mimeType: full.meta.mimeType,
    width: full.meta.width,
    height: full.meta.height,
    fileSizeBytes: full.meta.fileSizeBytes,
    processedWidth: full.processedWidth,
    processedHeight: full.processedHeight,
    preprocessError: full.preprocessError,
    libraryLineCount: lines.length,
    libraryLinesSample: JSON.stringify(lines.slice(0, 48)),
    ocrTextLength: full.ocr.text.length,
    ocrThrownError: full.ocr.error,
    ocrUnsupported: full.ocr.unsupported,
  };
}
