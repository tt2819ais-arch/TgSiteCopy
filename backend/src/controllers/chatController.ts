import { Request, Response } from 'express';
import chatService from '../services/chatService';
import ChatModel from '../models/Chat';
import { successResponse } from '../utils/helpers';

export const chatController = {
  async getChats(req: Request, res: Response) {
    try {
      const result = await chatService.getUserChats(req.user!.userId);
      res.json(successResponse(result));
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getChat(req: Request, res: Response) {
    try {
      const chat = await chatService.getChat(req.params.chatId);
      res.json(successResponse(chat));
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  },

  async createPrivateChat(req: Request, res: Response) {
    try {
      const chat = await chatService.createPrivateChat(req.user!.userId, req.body.userId);
      const full = await chatService.getChat(chat.id);
      res.status(201).json(successResponse(full));
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async deleteChat(req: Request, res: Response) {
    try {
      await ChatModel.delete(req.params.chatId);
      res.json(successResponse(null));
    } catch {
      res.status(500).json({ success: false, error: 'Ошибка удаления' });
    }
  },

  async pinChat(req: Request, res: Response) {
    await ChatModel.updateParticipant(req.params.chatId, req.user!.userId, { isPinned: true });
    res.json(successResponse(null));
  },

  async unpinChat(req: Request, res: Response) {
    await ChatModel.updateParticipant(req.params.chatId, req.user!.userId, { isPinned: false });
    res.json(successResponse(null));
  },

  async muteChat(req: Request, res: Response) {
    await ChatModel.updateParticipant(req.params.chatId, req.user!.userId, { isMuted: true });
    res.json(successResponse(null));
  },

  async unmuteChat(req: Request, res: Response) {
    await ChatModel.updateParticipant(req.params.chatId, req.user!.userId, { isMuted: false });
    res.json(successResponse(null));
  },

  async markAsRead(req: Request, res: Response) {
    await ChatModel.resetUnread(req.params.chatId, req.user!.userId);
    res.json(successResponse(null));
  },

  async searchChats(req: Request, res: Response) {
    res.json(successResponse([]));
  },
};

export default chatController;
