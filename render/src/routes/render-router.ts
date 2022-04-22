import StatusCodes from 'http-status-codes';
import {Request, Response, Router} from 'express';

import renderService from '@services/render-service';

// Constants
const router = Router();
const { OK } = StatusCodes;

// Paths
export const p = {
    get: '/get',
} as const;

router.get(p.get, async (_: Request, res: Response) => {
    const preview = await renderService.render();
    // return res.status(OK).json({ previews });
    console.warn(preview);
    return res.sendFile(preview)
});

// Export default
export default router;
