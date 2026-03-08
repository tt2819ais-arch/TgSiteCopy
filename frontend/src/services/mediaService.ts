import api from './api';
import type { ApiResponse, FileUploadResult } from '@/types/common';

export const mediaService = {
  async uploadFile(file: File, type: string = 'file'): Promise<FileUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const res = await api.upload<ApiResponse<FileUploadResult>>('/media/upload', formData);
    return res.data;
  },

  async uploadImage(file: File): Promise<FileUploadResult> {
    return this.uploadFile(file, 'image');
  },

  async uploadVideo(file: File): Promise<FileUploadResult> {
    return this.uploadFile(file, 'video');
  },

  async uploadAudio(blob: Blob, filename: string = 'voice.webm'): Promise<FileUploadResult> {
    const file = new File([blob], filename, { type: blob.type });
    return this.uploadFile(file, 'audio');
  },

  async uploadVideoCircle(blob: Blob): Promise<FileUploadResult> {
    const file = new File([blob], 'video_circle.webm', { type: 'video/webm' });
    return this.uploadFile(file, 'video_circle');
  },

  async deleteFile(fileId: string): Promise<void> {
    await api.delete(`/media/${fileId}`);
  },

  getFileUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `/uploads/${path}`;
  },

  async getImageThumbnail(file: File, maxSize = 200): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = () => reject(new Error('Не удалось создать превью'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
      reader.readAsDataURL(file);
    });
  },
};

export default mediaService;
