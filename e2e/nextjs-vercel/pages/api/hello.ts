// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

function handler() {
	const user = {
		name: 'vadim',
	} as any
	for (let i = 0; i < 100; i++) {
		user[i.toString()] = Math.random()
	}

	console.log('hey handler')
	console.warn('warning!')
	if (Math.random() < 0.25) {
		throw new Error(`a random api error occurred! ${Math.random()}`)
	}
	console.error(`whoa there! ${Math.random()}`)
}

export default handler
