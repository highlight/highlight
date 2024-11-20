import chromium from '@sparticuz/chromium'
import { mkdtemp, readFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import puppeteer from 'puppeteer-core'
import type { Browser, CookieParam, Page } from 'puppeteer-core'
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'
import { promisify } from 'util'

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

async function setupOAuthProjectToken(
	page: Page,
	apiConfig: {
		domain: string
		oauthURL: string
		apiURL: string
		clientID: string
		clientSecret: string
		project: number
	},
) {
	const r = await fetch(
		`${apiConfig.oauthURL}/token?grant_type=client_credentials&client_id=${apiConfig.clientID}&client_secret=${apiConfig.clientSecret}`,
		{
			method: 'POST',
			mode: 'no-cors',
		},
	)
	const data = await r.json()
	const accessToken = data['access_token']

	// set asset cookie from project-token api
	const token = await fetch(
		`${apiConfig.apiURL}/project-token/${apiConfig.project}`,
		{
			credentials: 'include',
			headers: { Authorization: `Bearer ${accessToken}` },
		},
	)
	for (const cookie of token.headers.getSetCookie()) {
		const value = cookie.split(';')[0]
		const [k, v] = value.trim().split('=')
		const cookieParam = {
			name: k,
			value: v,
			domain: apiConfig.domain,
			path: '/',
			expires: new Date().getTime() + 15 * 60 * 1000,
			httpOnly: true,
			secure: true,
			sameSite: 'None',
		} as CookieParam
		await page.setCookie(cookieParam)
	}
}

export interface RenderConfig {
	fps?: number
	dir?: string
	video?: boolean
	ts?: number
	tsEnd?: number
	chunk?: number
	domain?: string
	oauthURL?: string
	apiURL?: string
}

export async function render(
	project: number,
	events: string,
	chunk_idx: number,
	intervals: any[],
	worker: number,
	workers: number,
	{ fps, ts, tsEnd, dir, video, ...apiConfig }: RenderConfig,
) {
	let files: string[] = []
	if (ts === undefined && fps === undefined) {
		throw new Error('timestamp or fps must be provided')
	}
	events = events.replace(/\\/g, '\\\\')
	events = events.replace(/`/g, '\\`')
	events = events.replace(/\$/g, '\\$')
	if (!dir?.length) {
		const prefix = path.join(tmpdir(), `render_${chunk_idx}_`)
		dir = await promisify(mkdtemp)(prefix)
	}

	let browser: Browser
	if (process.env.DEV?.length) {
		console.log(`starting puppeteer for dev`)
		browser = await puppeteer.launch({
			channel: 'chrome',
			headless: true,
			args: ['--no-sandbox'],
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
	page.on('console', (message) =>
		console.log(
			`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`,
		),
	)
	const finishedPromise = new Promise<void>(
		async (r) => await page.exposeFunction('onReplayFinish', () => r()),
	)
	const js = readFileSync(
		path.join(
			path.resolve(),
			'node_modules',
			'rrweb',
			'dist',
			'rrweb.umd.min.cjs',
		),
		'utf8',
	)
	const css = readFileSync(
		path.join(path.resolve(), 'node_modules', 'rrweb', 'dist', 'style.css'),
		'utf8',
	)
	await page.goto('https://app.highlight.io')
	await page.setContent(getHtml(css, js))
	await setupOAuthProjectToken(page, {
		domain: apiConfig?.domain ?? 'pri.highlight.io',
		oauthURL: apiConfig?.oauthURL ?? 'https://pri.highlight.io/oauth',
		apiURL: apiConfig?.apiURL ?? 'https://pri.highlight.io',
		clientID: process.env.OAUTH_CLIENT_ID ?? '',
		clientSecret: process.env.OAUTH_CLIENT_SECRET ?? '',
		project,
	})
	await page.evaluate(
		`
        const events = JSON.parse(` +
			'`' +
			events +
			'`' +
			`);
        const intervals = JSON.parse(` +
			'`' +
			JSON.stringify(intervals) +
			'`' +
			`);
        window.r = new rrweb.Replayer(events, {
        	target: document.body,
            triggerFocus: true,
            mouseTail: true,
            UNSAFE_replayCanvas: true,
            liveMode: false,
            useVirtualDom: true,
            speed: 8
        });
        window.getInactivityEnd = (time) => {
			for (const interval of intervals) {
				if (time >= interval.start_time && time < interval.end_time) {
					if (!interval.active) {
						return interval.end_time
					} else {
                        return undefined
					}
				}
			}
		}
        
     	const skipInactivity = () => {
		    // skip inactive intervals
		    const start = window.r.getMetaData().startTime
		    const intervalsEnd = intervals[intervals.length - 1].end_time
		    const timestamp = window.r.getCurrentTime() + start
		    if (timestamp > intervalsEnd) {
		    	console.log('done at ' + timestamp)
                window.r.pause()
                window.onReplayFinish()
                return
		    }
     		const end = window.getInactivityEnd(timestamp)
     		if (end !== undefined) {
            	console.log('skipping from ' + timestamp + ' to ' + end + ' due to inactivity')
		    	window.r.play(end - start)
     		}
     	}
     	const inactivityLoop = () => {
        	skipInactivity()
        	window.requestAnimationFrame(inactivityLoop)
        }
        inactivityLoop();
        
        window.r.on('resize', (e) => {viewport = e});
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
	await page.setViewport({ width, height })

	if (video) {
		// @ts-ignore - complains about the use of puppeteer-core instead of puppeteer
		const recorder = new PuppeteerScreenRecorder(page, {
			followNewTab: true,
			fps: 25,
			videoFrame: {
				width,
				height,
			},
			ffmpeg_Path: process.env.DEV?.length
				? undefined
				: '/opt/bin/ffmpeg',
			videoCrf: 23,
			videoCodec: 'libx264',
			videoPreset: 'ultrafast',
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
		await finishedPromise
		await recorder.stop()
	} else {
		let interval = 1000
		let start = ts ?? meta.startTime
		let end = tsEnd ?? ts ?? meta.endTime
		if (fps) {
			interval = Math.round(1000 / fps)
			start = ts ?? Math.floor((meta.totalTime / workers) * worker)
			end =
				tsEnd ??
				ts ??
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
