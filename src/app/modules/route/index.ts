
import { UserRoute } from '../user/user.route';
import express from 'express';

const router = express.Router();
const moduleRoute = [
  {
    path: '/auth',
    route: UserRoute,
  }
];

moduleRoute.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
