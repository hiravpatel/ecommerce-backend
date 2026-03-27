import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

function ensureDirectory(directory: string) {
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
}

export function createDiskStorage(relativeDirectory: string) {
  const destination = join(process.cwd(), 'uploads', relativeDirectory);
  ensureDirectory(destination);

  return diskStorage({
    destination: (_request, _file, callback) => {
      callback(null, destination);
    },
    filename: (_request, file, callback) => {
      const timestamp = Date.now();
      const extension = extname(file.originalname) || '';
      const baseName = sanitizeFileName(file.originalname.replace(extension, ''));
      callback(null, `${timestamp}-${baseName}${extension}`);
    },
  });
}

export function buildUploadUrl(relativeDirectory: string, fileName: string) {
  return `/uploads/${relativeDirectory}/${fileName}`.replace(/\\/g, '/');
}
