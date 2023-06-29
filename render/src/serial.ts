import { render } from './render'
import { getEvents } from './s3'
import path from 'path'
import { tmpdir } from 'os'
import { promisify } from 'util'
import { exists, mkdir } from 'fs'

export async function serialRender(
	project: number,
	session: number,
	ts?: number,
	tsEnd?: number,
	fps?: number,
	chunk?: number,
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
	const events = await getEvents(project, session, chunk)
	console.log(
		`got events ${
			events.length
		} serial render for ${project} ${session} ${ts}-${tsEnd} ${
			chunk || ''
		}`,
	)
	return {
		dir,
		files: await render(events, 0, 1, fps, ts, tsEnd, dir),
	}
}
