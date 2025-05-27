import {Router} from 'express';
import { LoginSetup } from '../loginSetup.js';

const userAuthRouter = Router();

userAuthRouter.route('/signin').post(LoginSetup);
export default userAuthRouter;