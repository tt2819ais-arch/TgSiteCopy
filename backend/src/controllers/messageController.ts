import { Request, Response } from 'express';
import messageService from '../services/messageService';
import { successResponse } from '../utils/helpers';

export const messageController = {
  async getMessages(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await messageService.getMessages(req.params.chatId, page, limit);
      res.json(successResponse(result));
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async sendMessage(req: Request, res: Response) {
    try {
      const { type, content, replyToId } = req.body;
      const message = await messageService.sendMessage(
        req.params.chatId, req.user!.userId, type || 'text', content || '', replyToId
      );
      res.status(201).json(successResponse(message));
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async editMessage(req: Request, res: Response) {
    try {
      const message = await messageService.editMessage(req.params.chatId, req.params.messageId, req.body.content);
      res.json(successResponse(message));
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async deleteMessage(req: Request, res: Response) {
    try {
      await messageService.deleteMessage(req.params.chatId, req.params.messageId);
      res.json(successResponse(null));
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async addReaction(req: Request, res: Response) {
    res.json(successResponse(null));
  },

  async removeReaction(req: Request, res: Response) {
    res.json(successResponse(null));
  },
};

export default messageController;
