import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { corsOptions } from './config/cors';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { mediaService } from './services/mediaService';

const app = express();

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors(corsOptions));
app.use(compression());
app.use(morgan('short'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Статические файлы
mediaService.ensureUploadDir();
app.use('/uploads', express.static(path.resolve('./uploads')));

// API
app.use('/api', routes);

// Error handler
app.use(errorHandler);

export default app;
