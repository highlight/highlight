import { $, execa } from 'execa'

const isDopplerAvailable = await $`which doppler`
	.then(() => true)
	.catch(() => false)
const config = process.argv[2]
const command = process.argv[3]

if (!config) {
	throw new Error('missing config')
}

if (!command) {
	throw new Error('missing command')
}

isDopplerAvailable
	? await $`doppler run -c ${config} --command='${command}'`.then((result) =>
			console.log(result.stdout),
	  )
	: await execa(command, { shell: true }).then((result) =>
			console.log(result.stdout),
	  )
