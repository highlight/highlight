export const font = fetch(
	// @ts-ignore
	new URL('../../../styles/font/Poppins-SemiBold.ttf', import.meta.url),
).then((res) => res.arrayBuffer())

export const fontLight = fetch(
	// @ts-ignore
	new URL('../../../styles/font/Poppins-Light.ttf', import.meta.url),
).then((res) => res.arrayBuffer())

export const logoOnDark = fetch(
	// @ts-ignore
	new URL('../../../public/images/logo-on-dark.png', import.meta.url),
).then((res) => res.arrayBuffer())

export const bug1 = fetch(
	// @ts-ignore
	new URL('../../../public/images/bug1.png', import.meta.url),
).then((res) => res.arrayBuffer())

export const bug2 = fetch(
	// @ts-ignore
	new URL('../../../public/images/bug2.png', import.meta.url),
).then((res) => res.arrayBuffer())

export const backdrop = fetch(
	// @ts-ignore
	new URL('../../../public/images/backdrop.png', import.meta.url),
).then((res) => res.arrayBuffer())
