import { render } from './render'
import { getEvents } from './s3'
import cluster from 'cluster'
import path from 'path'
import { tmpdir } from 'os'
import fs, { exists, mkdir } from 'fs'
import { promisify } from 'util'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const WORKERS = 2

export async function parallelRender(project: number, session: number) {
	console.log(`starting parallel render for ${project} ${session}`)
	const dir = path.join(tmpdir(), `render_${project}_${session}`)
	if (!(await promisify(exists)(dir))) {
		await promisify(mkdir)(dir)
	}
	let events = await getEvents(project, session)
	console.log(
		`got events ${events.length} parallel render for ${project} ${session}`,
	)

	if (cluster.isPrimary) {
		await delay(100)
		for (let i = 0; i < WORKERS; i++) {
			cluster.fork()
		}
	} else {
		await render(
			events,
			cluster.worker?.id || 0,
			WORKERS,
			1,
			undefined,
			dir,
		)
		process.exit(0)
	}
	let workersFinished = 0
	cluster.on('disconnect', () => {
		workersFinished += 1
	})
	while (workersFinished < WORKERS) {
		if (workersFinished > 0) {
			console.log(`workers finished: ${workersFinished}/${WORKERS}`)
		}
		await delay(100)
	}

	const files: string[] = []
	for (const file of fs.readdirSync(dir)) {
		if (!fs.statSync(file).isDirectory()) {
			files.push(file)
		}
	}
	return { files, dir }
}
