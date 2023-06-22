import { exec as execAsync } from 'child_process'
import { promisify } from 'util'

export const encodeGIF = async function (dir: string) {
	const exec = promisify(execAsync)
	const { stdout, stderr } = await exec(
		`ffmpeg -y -f image2 -pattern_type glob ` +
			`-i '${dir}/*.png' -i /tmp/palette.png ` +
			`-vf "fps=40,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" ` +
			`/tmp/out.gif`,
	)
	console.log('ffmpeg', { stdout, stderr })
	return '/tmp/out.gif'
}

export const encodeMP4 = async function (dir: string) {
	const exec = promisify(execAsync)
	const { stdout, stderr } = await exec(
		`ffmpeg -y -framerate 40 -pattern_type glob ` +
			`-i '${dir}/*.png' -c:v libx264 /tmp/out.mp4`,
	)
	console.log('ffmpeg', { stdout, stderr })
	return '/tmp/out.mp4'
}
