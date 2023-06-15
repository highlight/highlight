import { exec as execAsync } from 'child_process'
import { promisify } from 'util'

export const encodeGIF = async function (dir: string) {
	const exec = promisify(execAsync)
	const { stdout, stderr } = await exec(
		`ffmpeg -framerate 30 -f image2 -pattern_type glob ` +
			`-i '${dir}/*.png' -vf scale=1280x720 /tmp/out.gif`,
	)
	console.log('ffmpeg', { stdout, stderr })
	return '/tmp/out.gif'
}

export const encodeMP4 = async function (dir: string) {
	const exec = promisify(execAsync)
	const { stdout, stderr } = await exec(
		`ffmpeg -framerate 30 -pattern_type glob ` +
			`-i '${dir}/*.png' -c:v libx264 /tmp/out.mp4`,
	)
	console.log('ffmpeg', { stdout, stderr })
	return '/tmp/out.mp4'
}
