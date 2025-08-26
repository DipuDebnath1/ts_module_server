import express, { Application, ErrorRequestHandler, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import router from './app/modules/route';
import notFoundRoute from './midlewere/notFoundRoute';
import globalErrorHandler from './midlewere/globalErrorHandler';
import { logger } from './app/logger';

const app: Application = express();

// 🔹 Security & Performance Middleware
app.use(helmet());
app.use(compression());



// 🔹 CORS (configure via ENV for production)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// set public folder to static 
app.use(express.static("public"));


// 🔹 Logging
app.use(morgan('dev', { stream: { write: (msg:any) => logger.info(msg.trim()) } }));
// if (config.node !== "test") {
//   app.use(morgan.successHandler);
//   app.use(morgan.errorHandler);
// }

// 🔹 Routes
app.use('/api', router);



// Default Route
app.get('/', (req: Request, res: Response) => {
  res.send('server running...');
});

// 🔹 Error Handling
app.use(notFoundRoute);
app.use(globalErrorHandler as ErrorRequestHandler);

export default app;
