import { extractTextFromImage as extractFromModule, isSupported } from 'expo-text-extractor';

/**
 * On-device OCR via expo-text-extractor.
 *
 * Note: Local OCR may require a development build depending on package/native module support.
 * Expo Go can lag behind or omit native modules — if scans always return empty text, use
 * `npx expo run:android` / `npx expo run:ios` or EAS Build instead of Expo Go.
 */

export type OcrExtractResult = {
  /** Normalized joined lines from the native extractor (may be empty). */
  text: string;
  /** Error message when the native module throws; null on success. */
  error: string | null;
  /** True when `isSupported` is false (e.g. web or unsupported runtime). */
  unsupported: boolean;
};

/**
 * OCR from an image URI. Does not call external APIs.
 * Returns structured result so callers can log errors and show diagnostics.
 */
export async function extractTextFromImage(uri: string): Promise<OcrExtractResult> {
  if (typeof uri !== 'string' || !uri.trim()) {
    return { text: '', error: null, unsupported: false };
  }

  if (!isSupported) {
    return { text: '', error: null, unsupported: true };
  }

  try {
    const lines = await extractFromModule(uri.trim());
    if (!Array.isArray(lines)) {
      return { text: '', error: null, unsupported: false };
    }
    const text = lines.join('\n').trim();
    return { text, error: null, unsupported: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('OCR extract failed:', error);
    return { text: '', error: message, unsupported: false };
  }
}
