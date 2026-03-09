import { Request, Response, NextFunction } from 'express';
import { isValidUsername, isValidPassword, isValidMessage, isValidBio } from '../utils/validators';

export function validateRegistration(req: Request, res: Response, next: NextFunction): void {
  const { username, password, passwordConfirm } = req.body;

  if (!username || !isValidUsername(username)) {
    res.status(400).json({ success: false, error: 'Некорректное имя пользователя (3-11 символов, латиница, цифры, _)' });
    return;
  }

  if (!password || !isValidPassword(password)) {
    res.status(400).json({ success: false, error: 'Пароль должен быть от 6 до 64 символов' });
    return;
  }

  if (password !== passwordConfirm) {
    res.status(400).json({ success: false, error: 'Пароли не совпадают' });
    return;
  }

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ success: false, error: 'Имя пользователя и пароль обязательны' });
    return;
  }

  next();
}

export function validateMessage(req: Request, res: Response, next: NextFunction): void {
  const { content, type } = req.body;

  if (type === 'text' && (!content || !isValidMessage(content))) {
    res.status(400).json({ success: false, error: 'Некорректное сообщение' });
    return;
  }

  next();
}

export function validateBio(req: Request, res: Response, next: NextFunction): void {
  const { bio } = req.body;

  if (bio !== undefined && !isValidBio(bio)) {
    res.status(400).json({ success: false, error: 'Био не должно превышать 200 символов' });
    return;
  }

  next();
}
