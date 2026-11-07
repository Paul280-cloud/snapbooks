import { createWorker } from 'tesseract.js';
import { parseReceiptText } from '../rules/receiptReader';
import type { OCRResult } from '../rules/receiptReader';

export type { OCRResult };

export async function readReceiptPhoto(file: File): Promise<OCRResult> {
  const worker = await createWorker('eng');
  try {
    const url = URL.createObjectURL(file);
    const { data } = await worker.recognize(url);
    URL.revokeObjectURL(url);
    return parseReceiptText(data.text);
  } finally {
    await worker.terminate();
  }
}
