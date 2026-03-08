import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  BIO_MAX_LENGTH,
  MESSAGE_MAX_LENGTH,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  AVATAR_MAX_SIZE,
} from './constants';

// ─── Имя пользователя ──────────────────────────────

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export interface ValidationResult {
  valid: boolean;
  error: string | null;
}

export function validateUsername(username: string): ValidationResult {
  const clean = username.startsWith('@') ? username.slice(1) : username;

  if (!clean) {
    return { valid: false, error: 'Имя пользователя обязательно' };
  }

  if (clean.length < USERNAME_MIN_LENGTH) {
    return {
      valid: false,
      error: `Минимум ${USERNAME_MIN_LENGTH} символа`,
    };
  }

  if (clean.length > USERNAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `Максимум ${USERNAME_MAX_LENGTH} символов`,
    };
  }

  if (!USERNAME_REGEX.test(clean)) {
    return {
      valid: false,
      error: 'Только латинские буквы, цифры и нижнее подчёркивание',
    };
  }

  return { valid: true, error: null };
}

// ─── Пароль ─────────────────────────────────────────

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: 'Пароль обязателен' };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      error: `Минимум ${PASSWORD_MIN_LENGTH} символов`,
    };
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return {
      valid: false,
      error: `Максимум ${PASSWORD_MAX_LENGTH} символов`,
    };
  }

  return { valid: true, error: null };
}

// ─── Подтверждение пароля ───────────────────────────

export function validatePasswordConfirm(
  password: string,
  confirm: string
): ValidationResult {
  if (!confirm) {
    return { valid: false, error: 'Подтвердите пароль' };
  }

  if (password !== confirm) {
    return { valid: false, error: 'Пароли не совпадают' };
  }

  return { valid: true, error: null };
}

// ─── Био ────────────────────────────────────────────

export function validateBio(bio: string): ValidationResult {
  if (bio.length > BIO_MAX_LENGTH) {
    return {
      valid: false,
      error: `Максимум ${BIO_MAX_LENGTH} символов`,
    };
  }

  return { valid: true, error: null };
}

// ─── Сообщение ──────────────────────────────────────

export function validateMessage(content: string): ValidationResult {
  if (!content.trim()) {
    return { valid: false, error: 'Сообщение не может быть пустым' };
  }

  if (content.length > MESSAGE_MAX_LENGTH) {
    return {
      valid: false,
      error: `Максимум ${MESSAGE_MAX_LENGTH} символов`,
    };
  }

  return { valid: true, error: null };
}

// ─── Файлы ──────────────────────────────────────────

export function validateFile(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Файл слишком большой. Максимум ${formatFileSize(MAX_FILE_SIZE)}`,
    };
  }

  return { valid: true, error: null };
}

export function validateImage(file: File): ValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Допустимые форматы: JPEG, PNG, WebP, GIF',
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Изображение слишком большое. Максимум ${formatFileSize(MAX_IMAGE_SIZE)}`,
    };
  }

  return { valid: true, error: null };
}

export function validateVideo(file: File): ValidationResult {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Допустимые форматы: MP4, WebM',
    };
  }

  if (file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Видео слишком большое. Максимум ${formatFileSize(MAX_VIDEO_SIZE)}`,
    };
  }

  return { valid: true, error: null };
}

export function validateAvatar(file: File): ValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Допустимые форматы: JPEG, PNG, WebP',
    };
  }

  if (file.size > AVATAR_MAX_SIZE) {
    return {
      valid: false,
      error: `Аватар слишком большой. Максимум ${formatFileSize(AVATAR_MAX_SIZE)}`,
    };
  }

  return { valid: true, error: null };
}

// ─── Вспомогательная ────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}
