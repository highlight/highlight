import { mkdtemp, readFileSync } from 'fs'
import { promisify } from 'util'
import path from 'path'
import { tmpdir } from 'os'
import chromium from '@sparticuz/chromium'
import puppeteer, { Browser } from 'puppeteer-core'
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'

const getHtml = (rrwebStyle: string, rrwebJs: string): string => {
	return `<html lang="en">
  <head>
  <title></title>
  <style>${rrwebStyle}</style>
  <style>html, body {padding: 0; border: none; margin: 0;}</style>
  <script>
    ${rrwebJs};
  </script>
  </head>
  <body>
  </body>
</html>`
}

export interface RenderConfig {
	fps?: number
	dir?: string
	video?: boolean
	ts?: number
	tsEnd?: number
	chunk?: number
}

export async function render(
	events: string,
	intervals: any[],
	worker: number,
	workers: number,
	{ fps, ts, tsEnd, dir, video }: RenderConfig,
) {
	let files: string[] = []
	if (ts === undefined && fps === undefined) {
		throw new Error('timestamp or fps must be provided')
	}
	events = events.replace(/\\/g, '\\\\')
	events = events.replace(/`/g, '\\`')
	events = events.replace(/\$/g, '\\$')
	if (!dir?.length) {
		const prefix = path.join(tmpdir(), 'render_')
		dir = await promisify(mkdtemp)(prefix)
	}

	let browser: Browser
	if (process.env.DEV?.length) {
		console.log(`starting puppeteer for dev`)
		browser = await puppeteer.launch({
			channel: 'chrome',
			headless: 'new',
		})
	} else {
		console.log(`starting puppeteer for lambda`)
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
	await page.exposeFunction(
		'onReplayProgressUpdate',
		(data: { payload: number }) => {
			console.log(data.payload)
		},
	)
	const finishedPromise = new Promise<void>(
		async (r) => await page.exposeFunction('onReplayFinish', () => r()),
	)
	const js = readFileSync(
		path.join(
			path.resolve(),
			'node_modules',
			'@highlight-run',
			'rrweb',
			'dist',
			'rrweb.min.js',
		),
		'utf8',
	)
	const css = readFileSync(
		path.join(
			path.resolve(),
			'node_modules',
			'@highlight-run',
			'rrweb',
			'dist',
			'rrweb.css',
		),
		'utf8',
	)
	await page.setContent(getHtml(css, js))
	await page.evaluate(
		`
        const events = JSON.parse(` +
			'`' +
			events +
			'`' +
			`);
        window.r = new rrweb.Replayer(events, {
        	target: document.body,
            triggerFocus: true,
            mouseTail: true,
            UNSAFE_replayCanvas: true,
            liveMode: false,
            speed: 16
        });
        window.r.on('resize', (e) => {viewport = e});
     	window.r.on('ui-update-progress', (p) => window.onReplayProgressUpdate(p));
        window.r.on('finish', () => window.onReplayFinish());
        window.r.pause(0);
        
        meta = window.r.getMetaData();
        loaded = true;
    `,
	)
	await page.waitForFunction('loaded')
	console.log(`puppeteer loaded`)
	const meta = (await page.evaluate('meta')) as {
		startTime: number
		endTime: number
		totalTime: number
	}
	const width = Number(await page.evaluate(`viewport.width`))
	const height = Number(await page.evaluate(`viewport.height`))
	console.log(`puppeteer meta`, { meta, width, height })
	await page.setViewport({ width: width, height: height })

	if (video) {
		// @ts-ignore - complains about the use of puppeteer-core instead of puppeteer
		const recorder = new PuppeteerScreenRecorder(page, {
			followNewTab: true,
			fps,
			videoFrame: {
				width,
				height,
			},
			videoCrf: 20,
			videoCodec: 'libx264',
			videoPreset: 'fast',
			videoBitrate: 1000,
			aspectRatio: '16:9',
		})
		const file = path.join(dir, 'video.mp4')
		files.push(file)
		await recorder.start(file)
		console.log(`starting video recording`, {
			fps,
			ts,
			tsEnd,
		})
		await page.evaluate(`r.play(${ts})`)
		// TODO(vkorolik) use intervals and onReplayProgressUpdate to skip
		await finishedPromise
		await recorder.stop()
	} else {
		let interval = 1000
		let start = ts || meta.startTime
		let end = tsEnd || ts || meta.endTime
		if (fps) {
			interval = Math.round(1000 / fps)
			start = ts || Math.floor((meta.totalTime / workers) * worker)
			end =
				tsEnd ||
				ts ||
				Math.floor((meta.totalTime / workers) * (worker + 1))
		}
		console.log(`starting screenshotting`, {
			start,
			end,
			interval,
			fps,
			ts,
			tsEnd,
		})
		for (let i = start; i <= end; i += interval) {
			const idx = files.length
			const file = path.join(dir, `${idx}.png`)
			await page.evaluate(`r.pause(${i})`)
			await page.screenshot({ path: file })
			console.log(`screenshotted`, { start, end, interval, i, idx })
			files.push(file)
		}
	}

	// puppeteer shutdown should not happen in lambda as it causes the lambda to hang
	if (process.env.DEV?.length) {
		await page.close()
		await browser.close()
	}
	console.log(`done`, { files })

	return files
}
