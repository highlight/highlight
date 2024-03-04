import { exec as execAsync } from 'child_process'
import * as fs from 'fs'
import { promisify } from 'util'

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
	const { stdout, stderr } = await exec(
		`ffmpeg -f concat -safe 0 -i /tmp/files.txt -c copy /tmp/out.mp4`,
	)
	console.log('ffmpeg combineMP4', { stdout, stderr })
	return '/tmp/out.mp4'
}
