import dotenv from 'dotenv';
dotenv.config();

export default {
  name: process.env.NAME || 'your-app-name',
  node: process.env.NODE_ENV || 'development',
  serverPort: Number(process.env.PORT) || 8000,
  socketPort: Number(process.env.SOCKET_PORT) || 8001,
  ipAddress: process.env.IP_ADDRESS || '127.0.0.1',
  databaseUri: process.env.DATABASE_URI || '',
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || '',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || '',
  saltRounds: process.env.SALT_ROUNDS || '10',
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    },
    from: process.env.SMTP_MAIL,
  },
  aws: {
    bucketRegion: process.env.AWS_BUCKET_REGION,
    accessKeyId: process.env.AWS_YOUR_ACCESS_KEY,
    secretAccessKey: process.env.AWS_YOUR_SECRET_KEY,
  },
};
