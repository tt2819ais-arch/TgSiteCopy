import { v4 as uuidv4 } from 'uuid';

export function generateId(): string {
  return uuidv4();
}

export function paginate(page: number = 1, limit: number = 20) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const offset = (safePage - 1) * safeLimit;
  return { page: safePage, limit: safeLimit, offset };
}

export function paginatedResponse<T>(items: T[], total: number, page: number, limit: number) {
  return {
    items,
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

export function successResponse<T>(data: T, message?: string) {
  return { success: true, data, message };
}

export function errorResponse(error: string, status: number = 400) {
  return { success: false, data: null, error };
}

export function cleanUsername(username: string): string {
  return username.startsWith('@') ? username.slice(1) : username;
}
