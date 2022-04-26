import { render } from './render';
import { getEvents } from './s3';

export async function serialRender(
    project: number,
    session: number,
    ts: number
) {
    console.log(`starting serial render for ${project} ${session} ${ts}`)
    const events = await getEvents(project, session);
    return await render(events, 0, 1, undefined, ts);
}
