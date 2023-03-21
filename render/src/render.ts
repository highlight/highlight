import { mkdtemp, readFileSync } from 'fs'
import { promisify } from 'util'
import path from 'path'
import { tmpdir } from 'os'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

const getHtml = (): string => {
	return `<html lang="en"><head><title></title><style>

.rrwebPlayerWrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
.rrwebPlayerDiv {}
</style></head><body style="padding: 0; margin: 0">
  <div id="wrapper" class="rrwebPlayerWrapper">
    <div id="player" class="rrwebPlayerDiv"></div>
  </div>
</body></html>
    `
}

export async function render(
	events: string,
	worker: number,
	workers: number,
	fps?: number,
	ts?: number,
	dir?: string,
) {
	if (ts === undefined && fps === undefined) {
		throw new Error('timestamp or fps must be provided')
	}
	events = events.replace(/\\/g, '\\\\')
	if (!dir?.length) {
		const prefix = path.join(tmpdir(), 'render_')
		dir = await promisify(mkdtemp)(prefix)
	}

	const browser = await puppeteer.launch({
		args: chromium.args,
		defaultViewport: chromium.defaultViewport,
		executablePath: await chromium.executablePath(),
		headless: chromium.headless,
		ignoreHTTPSErrors: true,
	})

	const page = await browser.newPage()
	await page.goto('about:blank')
	await page.setContent(getHtml())

	const jsPath = path.join(
		path.dirname(__dirname),
		'node_modules',
		'@highlight-run',
		'rrweb',
		'dist',
		'rrweb.min.js',
	)
	const js = readFileSync(jsPath, 'utf8')
	await page.evaluate(js)
	await page.evaluate(
		`
        const playerMountingRoot = document.getElementById('player');
        const events = JSON.parse(` +
			'`' +
			events +
			'`' +
			`);
        const r = new rrweb.Replayer(events, {
            root: playerMountingRoot,
            triggerFocus: true,
            mouseTail: false,
            UNSAFE_replayCanvas: true,
            liveMode: false,
        });
        r.on('resize', (e) => {viewport = e});
        r.pause(0);
        
        meta = r.getMetaData();
        loaded = true;
    `,
	)
	await page.waitForFunction('loaded')
	const meta = (await page.evaluate('meta')) as {
		startTime: number
		endTime: number
		totalTime: number
	}
	const width = Number(await page.evaluate(`viewport.width`))
	const height = Number(await page.evaluate(`viewport.height`))
	await page.setViewport({ width: width + 16, height: height + 16 })

	let interval = 1000
	let start = ts || meta.startTime
	let end = ts || meta.endTime
	if (fps) {
		interval = Math.round(1000 / fps)
		start = Math.floor((meta.totalTime / workers) * worker)
		end = Math.floor((meta.totalTime / workers) * (worker + 1))
	}

	const files: string[] = []
	for (let i = start; i <= end; i += interval) {
		const file = path.join(dir, `${i}.png`)
		await page.evaluate(`r.pause(${i})`)
		await page.screenshot({ path: file })
		files.push(file)
	}

	await browser.close()
	return files
}
