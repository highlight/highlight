const { chromium } = require('playwright')
const { performance } = require('perf_hooks')

const chunkSizeCandidates = [
	// 25,
	// 100,
	// 200,
	// 300,
	// 400,
	// 500,
	// 600,
	// 700,
	// 800,
	// 900,
	1000,
	// 1500,
	// 2000,
	// 3000,
	5000, 100000, 100500, 200000, 200500,
]

const repetitions = 5
const testEmail = ''
const testPassword = ''
const results = []

;(async () => {
	for (chunkSize of chunkSizeCandidates) {
		const runResults = []

		for (run in Array.from(Array(repetitions))) {
			console.log(`${chunkSize}: run ${run}`)
			const browser = await chromium.launch()
			const context = await browser.newContext()
			const page = await browser.newPage()
			await page.goto(
				`https://frontend-pr-477-xvhi.onrender.com/1/sessions/298204?chunkSize=${chunkSize}`,
			)
			// Click [placeholder="Email"]
			await page.click('[placeholder="Email"]')
			// Fill [placeholder="Email"]
			await page.fill('[placeholder="Email"]', testEmail)
			// Click [placeholder="Password"]
			await page.click('[placeholder="Password"]')
			// Fill [placeholder="Password"]
			await page.fill('[placeholder="Password"]', testPassword)
			// Click button:has-text("Sign In")
			await page.click('button:has-text("Sign In")')

			const t0 = performance.now()
			// Click :nth-match(button, 2)
			await page.click(':nth-match(button, 2)')
			const t1 = performance.now()

			const delta = t1 - t0
			runResults.push(delta)
			console.log(runResults)

			await context.close()
			await browser.close()
		}

		results.push({
			chunkSize,
			average: runResults.reduce((a, b) => a + b) / runResults.length,
		})
		console.log(results)
	}

	console.log(results)
})()
