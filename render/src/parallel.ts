import { render } from './render';
import { getEvents } from './s3';
import cluster from 'cluster';
import path from 'path';
import { tmpdir } from 'os';
import { exists, mkdir, readFileSync, writeFileSync } from 'fs';
import { promisify } from 'util';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const WORKERS = 8;

export async function parallelRender(project: number, session: number) {
    const dir = path.join(tmpdir(), `render_${project}_${session}`);
    if (!(await promisify(exists)(dir))) {
        await promisify(mkdir)(dir);
    }
    const sessionFile = path.join(dir, 'session.json');
    let events: string;
    if (!(await promisify(exists)(sessionFile))) {
        events = await getEvents(project, session);
        writeFileSync(sessionFile, events);
    } else {
        events = readFileSync(sessionFile, 'utf8');
    }

    if (cluster.isPrimary) {
        await delay(100);
        for (let i = 0; i < WORKERS; i++) {
            cluster.fork();
        }
    } else {
        await render(events, cluster.worker?.id || 0, WORKERS, 1, undefined, dir);
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
    return dir;
}
