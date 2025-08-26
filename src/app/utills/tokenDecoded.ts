import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';

// token decoded
export const tokenDecoded = (item: string) => {
  const token = item.split(' ')[1];
  const decoded = jwt.verify(
    token as string,
    config.accessTokenSecret as string,
  ) as JwtPayload;
  return decoded;
};
