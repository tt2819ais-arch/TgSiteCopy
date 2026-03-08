const DB_NAME = 'nyxgram_db';
const DB_VERSION = 1;

class StorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('messages')) {
          const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
          msgStore.createIndex('chatId', 'chatId', { unique: false });
          msgStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('chats')) {
          db.createObjectStore('chats', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts', { keyPath: 'chatId' });
        }

        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = () => {
        console.warn('[Storage] IndexedDB не поддерживается, используем localStorage');
        reject(request.error);
      };
    });
  }

  // ─── Generic операции ───────────────────────────────

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('БД не инициализирована');
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  async put<T>(storeName: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName, 'readwrite');
        const request = store.put(data);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch {
        resolve();
      }
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result as T | undefined);
        request.onerror = () => reject(request.error);
      } catch {
        resolve(undefined);
      }
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
      } catch {
        resolve([]);
      }
    });
  }

  async remove(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName, 'readwrite');
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch {
        resolve();
      }
    });
  }

  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName, 'readwrite');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch {
        resolve();
      }
    });
  }

  // ─── Сообщения ──────────────────────────────────────

  async getMessagesByChat<T>(chatId: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore('messages');
        const index = store.index('chatId');
        const request = index.getAll(chatId);
        request.onsuccess = () => resolve(request.result as T[]);
        request.onerror = () => reject(request.error);
      } catch {
        resolve([]);
      }
    });
  }

  async putMany<T>(storeName: string, items: T[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const store = this.getStore(storeName, 'readwrite');
        let completed = 0;

        items.forEach((item) => {
          const request = store.put(item);
          request.onsuccess = () => {
            completed++;
            if (completed === items.length) resolve();
          };
          request.onerror = () => reject(request.error);
        });

        if (items.length === 0) resolve();
      } catch {
        resolve();
      }
    });
  }

  // ─── Черновики ──────────────────────────────────────

  async saveDraft(chatId: string, content: string): Promise<void> {
    if (!content.trim()) {
      await this.remove('drafts', chatId);
      return;
    }
    await this.put('drafts', { chatId, content, updatedAt: new Date().toISOString() });
  }

  async getDraft(chatId: string): Promise<string> {
    const draft = await this.get<{ content: string }>('drafts', chatId);
    return draft?.content || '';
  }

  // ─── Кеш ───────────────────────────────────────────

  async setCache(key: string, value: unknown, ttl: number = 300000): Promise<void> {
    await this.put('cache', {
      key,
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  async getCache<T>(key: string): Promise<T | null> {
    const entry = await this.get<{ value: T; expiresAt: number }>('cache', key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      await this.remove('cache', key);
      return null;
    }
    return entry.value;
  }

  // ─── localStorage фолбек ───────────────────────────

  setLocal(key: string, value: unknown): void {
    try {
      localStorage.setItem(`nyxgram_${key}`, JSON.stringify(value));
    } catch {
      // overflow
    }
  }

  getLocal<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`nyxgram_${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  removeLocal(key: string): void {
    localStorage.removeItem(`nyxgram_${key}`);
  }

  // ─── Очистка всего ─────────────────────────────────

  async clearAll(): Promise<void> {
    const stores = ['messages', 'chats', 'users', 'drafts', 'cache'];
    for (const store of stores) {
      await this.clear(store).catch(() => {});
    }
  }
}

export const storageService = new StorageService();
export default storageService;
