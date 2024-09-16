import { Router } from 'express';

import routeUsers from './routeUsers.js';

const routes = Router();

routes.use( '/', routeUsers);

export default routes;
