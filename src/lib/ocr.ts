import { extractTextFromImage as extractFromModule, isSupported } from 'expo-text-extractor';

/**
 * OCR from an image URI. Returns empty string when unsupported, invalid input, or on failure.
 * PDFs and non-images should not call this — handle separately in the UI layer.
 */
export async function extractTextFromImage(uri: string): Promise<string> {
  if (typeof uri !== 'string' || !uri.trim()) {
    return '';
  }

  if (!isSupported) {
    return '';
  }

  try {
    const lines = await extractFromModule(uri.trim());
    if (!Array.isArray(lines)) {
      return '';
    }
    return lines.join('\n').trim();
  } catch (error) {
    console.warn('OCR extract failed:', error);
    return '';
  }
}
