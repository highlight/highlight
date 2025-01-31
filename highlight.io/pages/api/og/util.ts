import { NextRequest } from 'next/server'

export const getResources = async (req: NextRequest) => {
	const prefix = req.url.substring(0, req.url.lastIndexOf('/api'))
	const font = fetch(
		new URL(`${prefix}/styles/font/Poppins-SemiBold.ttf`),
	).then((res) => res.arrayBuffer())

	const fontLight = fetch(
		new URL(`${prefix}/styles/font/Poppins-Light.ttf`),
	).then((res) => res.arrayBuffer())

	const backdrop = fetch(
		new URL(`${prefix}/public/images/backdrop.png`),
	).then((res) => res.arrayBuffer())

	return {
		font: await font,
		fontLight: await fontLight,
		backdrop: await backdrop,
	}
}
