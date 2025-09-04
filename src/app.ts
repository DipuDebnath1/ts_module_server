/* eslint-disable @typescript-eslint/no-explicit-any */
import express, {
  Application,
  ErrorRequestHandler,
  Request,
  Response,
} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import router from './app/modules/route';
import { logger } from './app/logger';
import notFoundRoute from './middleware/notFoundRoute';
import globalErrorHandler from './middleware/globalErrorHandler';
import { serverCorsOptions } from './config/corsOptions';

const app: Application = express();

// 🔹 Security & Performance Middleware
app.use(helmet());
app.use(compression());

app.use(cors(serverCorsOptions));

app.use(cookieParser());
app.use(express.json());

// set public folder to static
app.use(express.static('public'));

// 🔹 Logging
app.use(
  morgan('dev', { stream: { write: (msg: any) => logger.info(msg.trim()) } }),
);
// if (config.node !== "test") {
//   app.use(morgan.successHandler);
//   app.use(morgan.errorHandler);
// }

// 🔹 Routes
app.use('/api/v1', router);

// Default Route
app.get('/api', (req: Request, res: Response) => {
  res.send('server running...');
});

// 🔹 Error Handling
app.use(notFoundRoute);
app.use(globalErrorHandler as ErrorRequestHandler);

export default app;
