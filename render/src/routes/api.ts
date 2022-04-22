import {Router} from 'express';
import renderRouter from './render-router';

// Export the base-router
const baseRouter = Router();

// Setup routers
baseRouter.use('/render', renderRouter);

// Export default.
export default baseRouter;
