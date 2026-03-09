import env from './env';

// Имитация подключения к PostgreSQL
// В продакшене здесь будет pg.Pool
export interface DBQuery {
  text: string;
  values?: unknown[];
}

class Database {
  private connected = false;

  async connect(): Promise<void> {
    console.log(`[DB] Подключение к PostgreSQL ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);
    this.connected = true;
    console.log('[DB] Подключено (режим симуляции)');
  }

  async query<T = unknown>(query: DBQuery): Promise<{ rows: T[]; rowCount: number }> {
    if (!this.connected) {
      throw new Error('База данных не подключена');
    }
    // В продакшене: return pool.query(query.text, query.values);
    return { rows: [] as T[], rowCount: 0 };
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('[DB] Отключено');
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const db = new Database();
export default db;
