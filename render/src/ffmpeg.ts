import { exec as execAsync } from 'child_process'
import { promisify } from 'util'

export const encodeGIF = async function (dir: string) {
	const exec = promisify(execAsync)
	const { stdout, stderr } = await exec(
		`ffmpeg -framerate 9 -f image2 -pattern_type glob
		-i '${dir}/*.png' -vf scale=531x299,transpose=1,crop=299,431,0,100 /tmp/out.gif`,
	)
	console.log('ffmpeg', { stdout, stderr })
	return '/tmp/out.gif'
}

export const encodeMP4 = async function (dir: string) {
	const exec = promisify(execAsync)
	const { stdout, stderr } = await exec(
		`ffmpeg -framerate 30 -pattern_type glob
		-i '${dir}/*.png' -c:v libx264 -pix_fmt yuv420p /tmp/out.mp4`,
	)
	console.log('ffmpeg', { stdout, stderr })
	return '/tmp/out.mp4'
}
