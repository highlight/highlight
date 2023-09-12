import { render, RenderConfig } from './render'
import { getEvents } from './s3'
import path from 'path'
import { tmpdir } from 'os'
import { promisify } from 'util'
import { exists, mkdir } from 'fs'
import { getSessionIntervals } from './pg'

export async function serialRender(
	project: number,
	session: number,
	{ ts, tsEnd, fps, chunk, video }: RenderConfig,
) {
	const dir = path.join(tmpdir(), `render_${project}_${session}`)
	if (!(await promisify(exists)(dir))) {
		await promisify(mkdir)(dir)
	}

	console.log(
		`starting serial render for ${project} ${session} ${ts}-${tsEnd} ${
			chunk || ''
		}`,
	)
	const [events, intervals] = await Promise.all([
		getEvents(project, session, chunk),
		getSessionIntervals(project, session),
	])
	console.log(
		`got events ${events.length} got intervals ${
			intervals.length
		} serial render for ${project} ${session} ${ts}-${tsEnd} ${
			chunk || ''
		}`,
	)
	return {
		dir,
		files: await render(events, intervals, 0, 1, {
			fps,
			ts,
			tsEnd,
			dir,
			video,
		}),
	}
}
