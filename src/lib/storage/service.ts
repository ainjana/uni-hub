import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface UploadResult {
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
  'application/json',
]);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

export class StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
  }

  private async ensureDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  public async saveFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<UploadResult> {
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new Error(`Unsupported file type: ${mimeType}. Allowed formats: PDF, Images, Text, ZIP.`);
    }

    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds limit of 15MB. Your file is ${(fileBuffer.length / (1024 * 1024)).toFixed(1)}MB.`);
    }

    await this.ensureDir();

    const ext = path.extname(originalName) || '.bin';
    const hash = crypto.randomBytes(8).toString('hex');
    const safeBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFileName = `${Date.now()}_${safeBase}_${hash}${ext}`;
    const destinationPath = path.join(this.uploadDir, uniqueFileName);

    await fs.writeFile(destinationPath, fileBuffer);

    return {
      fileName: uniqueFileName,
      originalName,
      mimeType,
      sizeBytes: fileBuffer.length,
      url: `/uploads/${uniqueFileName}`,
    };
  }
}

export const storageService = new StorageService();
