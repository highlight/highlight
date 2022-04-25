import { render } from './render';
import { getEvents } from './s3';
import { parallelRender } from './parallel';

export async function serialRender(project: number, session: number) {
    const events = await getEvents(project, session);
    return await render(events, 0, 1, 1);
}

parallelRender(1, 33249519).then(console.warn).catch(console.error);
