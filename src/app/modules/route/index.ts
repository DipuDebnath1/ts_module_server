import express from 'express';
import { UserRoute } from '../user/user.route';
import { AuthRoute } from '../auth/auth.route';

const router = express.Router();
const moduleRoute = [
  {
    path: '/auth',
    route: AuthRoute,
  },
  {
    path: '/user',
    route: UserRoute,
  },
];

moduleRoute.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
