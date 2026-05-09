import { extractTextFromImage as extractFromModule, isSupported } from 'expo-text-extractor';

export async function extractTextFromImage(uri: string): Promise<string> {
  if (!uri?.trim()) return '';
  if (!isSupported) return '';
  try {
    const lines = await extractFromModule(uri);
    return lines.join('\n').trim();
  } catch (error) {
    console.warn('OCR extract failed:', error);
    return '';
  }
}
