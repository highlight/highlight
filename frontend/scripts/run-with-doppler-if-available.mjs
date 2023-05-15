import { $ } from 'execa'

const isDopplerAvailable = await $`which doppler`
	.then(() => true)
	.catch(() => false)

if (!isDopplerAvailable) return

const config = process.argv[2]
const command = process.argv[3]

if (!config) {
	throw new Error('missing config')
}

if (!command) {
	throw new Error('missing command')
}

await $`doppler run -c ${config} --command='${command}'`.then((result) =>
	console.log(result.stdout),
)
