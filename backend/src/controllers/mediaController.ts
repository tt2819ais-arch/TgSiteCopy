import { Request, Response } from 'express';
import { successResponse } from '../utils/helpers';

export const mediaController = {
  async upload(req: Request, res: Response) {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: 'Файл не прикреплён' });
      return;
    }

    res.json(successResponse({
      url: `/uploads/${file.filename}`,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    }));
  },
};

export default mediaController;
