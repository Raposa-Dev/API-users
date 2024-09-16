import { Router } from 'express';

import UserControllers from '../controllers/UserControllers.js';

const routeUsers = Router();

const userControllers = new UserControllers();

routeUsers.post('/user',userControllers.create );

routeUsers.get('/user/:id?', userControllers.read);

routeUsers.put('/user/:id', userControllers.update);

routeUsers.delete('/user/:id', userControllers.delete);

export default routeUsers;
