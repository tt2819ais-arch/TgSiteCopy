import path from 'path';
import fs from 'fs';
import env from '../config/env';

export const mediaService = {
  ensureUploadDir(): void {
    if (!fs.existsSync(env.UPLOAD_DIR)) {
      fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
    }
  },

  getFilePath(filename: string): string {
    return path.join(env.UPLOAD_DIR, filename);
  },

  deleteFile(filename: string): void {
    const filePath = this.getFilePath(filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  },

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  },
};

export default mediaService;
