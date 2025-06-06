import { exec as execAsync, spawn } from 'child_process'
import * as fs from 'fs'
import { promisify } from 'util'
import { randomBytes } from 'crypto'

const exec = promisify(execAsync)

export const encodeGIF = async function (dir: string) {
	const { stdout, stderr } = await exec(
		`ffmpeg -y -f image2 ` +
			`-i ${dir}/%d.png ` +
			`-vf "fps=40,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" ` +
			`/tmp/out.gif`,
	)
	console.log('ffmpeg encodeGIF', { stdout, stderr })
	return '/tmp/out.gif'
}

export const encodeMP4 = async function (dir: string) {
	const { stdout, stderr } = await exec(
		`ffmpeg -y -framerate 40 ` +
			`-i ${dir}/%d.png -c:v libx264 /tmp/out.mp4`,
	)
	console.log('ffmpeg encodeMP4', { stdout, stderr })
	return '/tmp/out.mp4'
}

export const combineMP4s = async function (...files: string[]) {
	fs.writeFileSync(
		'/tmp/files.txt',
		files.map((f) => `file '${f}'`).join('\n'),
	)
	const outputFile = `/tmp/${randomFileName('mp4')}`
	let child = spawn(`ffmpeg`, [
		`-y`,
		`-f`,
		`concat`,
		`-safe`,
		`0`,
		`-i`,
		`/tmp/files.txt`,
		`-c`,
		`copy`,
		outputFile,
	])
	child.stdout.on('data', function (data) {
		console.log('combineMP4s ffmpeg', data.toString())
	})
	child.stderr.on('data', function (data) {
		console.error('combineMP4s ffmpeg', data.toString())
	})

	const code = await new Promise<number | null>((r) => {
		child.on('close', (code) => {
			r(code)
		})
	})
	if (code === null || code > 0) {
		process.exit(code ?? 1)
	}
	return outputFile
}

const randomFileName = function (ext = '') {
	const randomHex = randomBytes(16).toString('hex') // 32-char hex
	return ext ? `${randomHex}.${ext.replace(/^\./, '')}` : randomHex
}
