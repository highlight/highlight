import { render } from './render'
import { getEvents } from './s3'

export async function serialRender(
	project: number,
	session: number,
	ts: number,
	chunk?: number,
) {
	console.log(
		`starting serial render for ${project} ${session} ${ts} ${chunk || ''}`,
	)
	const events = await getEvents(project, session, chunk)
	console.log(
		`got events ${
			events.length
		} serial render for ${project} ${session} ${ts} ${chunk || ''}`,
	)
	return await render(events, 0, 1, undefined, ts)
}
