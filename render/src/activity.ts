import { APIGatewayEvent } from 'aws-lambda'
import puppeteer, { Browser } from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

const WIDTH = 340
const HEIGHT = 170
const STROKE_WIDTH = 6.4

const graphAsSvg = (yValues: number[]) => `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="
	M ${(0 / 9) * WIDTH} ${yValues[0]}
	L ${(1 / 9) * WIDTH} ${yValues[1]}
	L ${(2 / 9) * WIDTH} ${yValues[2]}
	L ${(3 / 9) * WIDTH} ${yValues[3]}
	L ${(4 / 9) * WIDTH} ${yValues[4]}
	L ${(5 / 9) * WIDTH} ${yValues[5]}
	L ${(6 / 9) * WIDTH} ${yValues[6]}
	L ${(7 / 9) * WIDTH} ${yValues[7]}
	L ${(8 / 9) * WIDTH} ${yValues[8]}
	L ${(9 / 9) * WIDTH} ${yValues[9]}" 
	stroke="#744ED4" stroke-width="${STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
<path d="
	M ${(0 / 9) * WIDTH} ${yValues[0]}
	L ${(1 / 9) * WIDTH} ${yValues[1]}
	L ${(2 / 9) * WIDTH} ${yValues[2]}
	L ${(3 / 9) * WIDTH} ${yValues[3]}
	L ${(4 / 9) * WIDTH} ${yValues[4]}
	L ${(5 / 9) * WIDTH} ${yValues[5]}
	L ${(6 / 9) * WIDTH} ${yValues[6]}
	L ${(7 / 9) * WIDTH} ${yValues[7]}
	L ${(8 / 9) * WIDTH} ${yValues[8]}
	L ${(9 / 9) * WIDTH} ${yValues[9]}
	L ${WIDTH} ${HEIGHT}
	L 0 ${HEIGHT}
	Z" 
	opacity="0.4" stroke="none" fill="url(#paint0_linear_5794_49639)"/>
<defs>
<linearGradient id="paint0_linear_5794_49639" x1="${WIDTH / 2}" 
y1="${HEIGHT / 2}" x2="${
	WIDTH / 2
}" y2="${HEIGHT}" gradientUnits="userSpaceOnUse">
<stop stop-color="#6C37F4"/>
<stop offset="1" stop-color="#6C37F4" stop-opacity="0"/>
</linearGradient>
</defs>
</svg>
`

const svgToPng = async (svg: string) => {
	let browser: Browser
	if (process.env.DEV?.length) {
		browser = await puppeteer.launch({
			channel: 'chrome',
			headless: 'new',
			args: ['--no-sandbox'],
		})
	} else {
		browser = await puppeteer.launch({
			args: chromium.args,
			defaultViewport: chromium.defaultViewport,
			executablePath: await chromium.executablePath(),
			headless: chromium.headless,
			ignoreHTTPSErrors: true,
		})
	}

	const page = await browser.newPage()
	await page.goto('about:blank')
	await page.setContent(svg)

	await page.setViewport({ width: WIDTH + 16, height: HEIGHT + 16 })
	const res = await page.screenshot({
		encoding: 'base64',
		omitBackground: true,
		clip: {
			x: 8,
			y: 8,
			width: WIDTH,
			height: HEIGHT,
		},
	})

	if (process.env.DEV?.length) {
		await page.close()
		await browser.close()
	}

	return res
}

export const handler = async (event?: APIGatewayEvent) => {
	const body = event?.body
	if (!body) {
		console.error('event does not contain a body')
		return {
			statusCode: 400,
		}
	}

	const activity = JSON.parse(body) as number[]
	if (activity.length !== 100) {
		console.error(`activity length !== 100; actual: ${activity.length}`)
		return {
			statusCode: 400,
		}
	}

	const condensed: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	activity.forEach((a, idx) => {
		condensed[Math.floor(idx / 10)] += a
	})

	var max = 0
	condensed.forEach((a) => {
		if (a > max) {
			max = a
		}
	})

	const normalized = condensed.map((a) => a / max)
	const yValues = normalized.map(
		(a) => HEIGHT - (HEIGHT - STROKE_WIDTH) * a - STROKE_WIDTH / 2,
	)

	const svg = graphAsSvg(yValues)
	const pngBase64 = await svgToPng(svg)

	return {
		statusCode: 200,
		isBase64Encoded: true,
		body: pngBase64,
		headers: {
			'content-type': 'image/png',
		},
	}
}

if (process.env.DEV?.length) {
	Promise.all([
		handler({
			body: '[0,1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,2,0,0,0,0,0,0,0,2,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,2,3,5,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0]',
		} as unknown as APIGatewayEvent),
	]).then((res) => {
		for (const r of res) {
			console.log('activity lambda', r.body)
		}
	})
}
