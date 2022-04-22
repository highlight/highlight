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
    const path = '/home/vkorolik/work/highlight/render/sample.json'
    const preview = await renderService.render(path);
    return res.sendFile(preview[4])
});

// Export default
export default router;
