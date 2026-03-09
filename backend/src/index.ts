import http from 'http';
import app from './app';
import { SocketServer } from './websocket/socketServer';
import { db } from './config/database';
import { redis } from './config/redis';
import { logger } from './utils/logger';
import env from './config/env';
import UserModel from './models/User';
import { ADMIN_BALANCE } from './utils/constants';

async function seedAdmin() {
  const existing = await UserModel.findByUsername(env.ADMIN_USERNAME);
  if (!existing) {
    await UserModel.create(env.ADMIN_USERNAME, env.ADMIN_PASSWORD, 'admin', ADMIN_BALANCE);
    logger.info(`[Seed] Админ @${env.ADMIN_USERNAME} создан`);
  } else {
    logger.info(`[Seed] Админ @${env.ADMIN_USERNAME} уже существует`);
  }
}

async function bootstrap() {
  try {
    await db.connect();
    await redis.connect();

    const server = http.createServer(app);
    const socketServer = new SocketServer(server);

    await seedAdmin();

    server.listen(env.PORT, env.HOST, () => {
      logger.info(`[Server] Nyxgram запущен на http://${env.HOST}:${env.PORT}`);
      logger.info(`[Server] Среда: ${env.NODE_ENV}`);
    });

    const shutdown = async () => {
      logger.info('[Server] Остановка...');
      server.close();
      await db.disconnect();
      await redis.disconnect();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    logger.error('Ошибка запуска', err);
    process.exit(1);
  }
}

bootstrap();
