import { render } from './render';
import { getEvents } from './s3';
import cluster from 'cluster';
import path from 'path';
import { tmpdir } from 'os';
import { exists, mkdir, readFileSync, writeFileSync } from 'fs';
import { promisify } from 'util';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const WORKERS = 24;

export async function parallelRender(project: number, session: number) {
    const dir = path.join(tmpdir(), `render_${project}_${session}`);
    if (cluster.isPrimary) {
        if (!(await promisify(exists)(dir))) {
            await promisify(mkdir)(dir);
        }
        const events = await getEvents(project, session);
        writeFileSync(path.join(dir, 'session.json'), events);
        for (let i = 0; i < WORKERS; i++) {
            cluster.fork();
        }
    } else {
        const events = readFileSync(path.join(dir, 'session.json'), 'utf8');
        await render(events, cluster.worker?.id || 0, WORKERS, 30, dir);
        process.exit(0);
    }
    let workersFinished = 0;
    cluster.on('disconnect', () => {
        workersFinished += 1;
    });
    while (workersFinished < WORKERS) {
        if (workersFinished > 0) {
            console.log(`workers finished: ${workersFinished}/${WORKERS}`);
        }
        await delay(100);
    }
}
