import { NextRequest } from 'next/server'

export const getResources = async (req: NextRequest) => {
	let idx = req.url.lastIndexOf('/api')
	if (idx === -1) {
		idx = req.url.lastIndexOf('/_next')
	}
	const prefix = req.url.substring(0, idx)
	const font = fetch(
		new URL(`${prefix}/styles/font/Poppins-SemiBold.ttf`),
	).then((res) => res.arrayBuffer())

	const fontLight = fetch(
		new URL(`${prefix}/styles/font/Poppins-Light.ttf`),
	).then((res) => res.arrayBuffer())

	const backdrop = fetch(
		new URL(`${prefix}/public/images/backdrop.png`),
	).then((res) => res.arrayBuffer())

	const logoOnDark = fetch(
		new URL(`${prefix}/public/images/logo-on-dark.png`),
	).then((res) => res.arrayBuffer())

	const bug1 = fetch(new URL(`${prefix}/public/images/bug1.png`)).then(
		(res) => res.arrayBuffer(),
	)

	const bug2 = fetch(new URL(`${prefix}/public/images/bug2.png`)).then(
		(res) => res.arrayBuffer(),
	)

	return {
		font: await font,
		fontLight: await fontLight,
		backdrop: await backdrop,
		logoOnDark: await logoOnDark,
		bug1: await bug1,
		bug2: await bug2,
	}
}
