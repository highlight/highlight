import { exists, mkdir } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { promisify } from 'util'
import { combineMP4s } from './ffmpeg'
import { getSessionChunks, getSessionIntervals } from './pg'
import { render, RenderConfig } from './render'
import { getEvents } from './s3'

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
	const chunks = chunk
		? [chunk]
		: (await getSessionChunks(session)).map((c) => c.chunk_index)
	const [intervals, ...chunkEvents] = await Promise.all([
		getSessionIntervals(project, session),
		...chunks.map((idx) => getEvents(project, session, idx)),
	])
	console.log(
		`got events ${chunkEvents.length} chunks, total ${chunkEvents.reduce(
			(a, b) => a + b.length,
			0,
		)} got intervals ${
			intervals.length
		} serial render for ${project} ${session} ${ts}-${tsEnd} ${
			chunk || ''
		}`,
	)
	if (chunkEvents.length === 1) {
		return {
			dir,
			files: await render(chunkEvents[0], 0, intervals, 0, 1, {
				fps,
				ts,
				tsEnd,
				dir,
				video,
			}),
		}
	} else {
		const files: string[] = []
		for (const [idx, events] of chunkEvents.entries()) {
			files.push(
				...(await render(events, idx, intervals, 0, 1, {
					fps,
					video: true,
				})),
			)
		}
		console.log(`produced files ${files}. combining`)
		const out = await combineMP4s(...files)
		return { files: [out] }
	}
}
