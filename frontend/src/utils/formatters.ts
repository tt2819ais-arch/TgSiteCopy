// ─── Дата и время ───────────────────────────────────

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const dayMs = 86400000;

  if (diff < dayMs && date.getDate() === now.getDate()) {
    return 'Сегодня';
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()) {
    return 'Вчера';
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatChatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const dayMs = 86400000;

  if (diff < dayMs && date.getDate() === now.getDate()) {
    return formatTime(dateStr);
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()) {
    return 'Вчера';
  }

  if (diff < 7 * dayMs) {
    return date.toLocaleDateString('ru-RU', { weekday: 'short' });
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  }

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

export function formatLastSeen(dateStr: string | null): string {
  if (!dateStr) return 'давно';

  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 30) return 'только что';
  if (diff < 60) return 'менее минуты назад';
  if (diff < 3600) {
    const mins = Math.floor(diff / 60);
    return `${mins} ${pluralize(mins, 'минуту', 'минуты', 'минут')} назад`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} ${pluralize(hours, 'час', 'часа', 'часов')} назад`;
  }
  if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days} ${pluralize(days, 'день', 'дня', 'дней')} назад`;
  }

  return formatDate(dateStr);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ─── Числа ──────────────────────────────────────────

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}М`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}К`;
  }
  return num.toLocaleString('ru-RU');
}

export function formatBalance(amount: number): string {
  return amount.toLocaleString('ru-RU');
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} NYX`;
}

// ─── Файлы ──────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Б';

  const units = ['Б', 'КБ', 'МБ', 'ГБ'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toUpperCase() : '';
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
  return 'file';
}

// ─── Текст ──────────────────────────────────────────

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1).trimEnd() + '...';
}

export function formatUsername(username: string): string {
  if (username.startsWith('@')) return username;
  return `@${username}`;
}

export function cleanUsername(username: string): string {
  return username.startsWith('@') ? username.slice(1) : username;
}

export function formatMessagePreview(type: string, content: string): string {
  switch (type) {
    case 'image': return 'Фотография';
    case 'video': return 'Видео';
    case 'voice': return 'Голосовое сообщение';
    case 'video_circle': return 'Видеосообщение';
    case 'file': return 'Файл';
    case 'gift': return 'Подарок';
    case 'system': return content;
    default: return truncate(content, 50);
  }
}

// ─── Множественное число ────────────────────────────

export function pluralize(
  count: number,
  one: string,
  few: string,
  many: string
): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export function formatUnreadCount(count: number): string {
  if (count > 999) return '999+';
  return count.toString();
}

export function formatTypingText(usernames: string[]): string {
  if (usernames.length === 0) return '';
  if (usernames.length === 1) return `${usernames[0]} печатает...`;
  if (usernames.length === 2) return `${usernames[0]} и ${usernames[1]} печатают...`;
  return `${usernames[0]} и ещё ${usernames.length - 1} печатают...`;
}
