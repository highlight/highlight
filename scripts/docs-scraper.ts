import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'

async function parseHighlightDocs() {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()

	await page.goto('https://highlight.io/docs/general/welcome', {
		waitUntil: 'networkidle2',
	})

	let links = await page.evaluate(() => {
		return [...document.querySelectorAll('.Docs_leftSection__fkw4L a')].map(
			(el) => el.getAttribute('href'),
		)
	})
	links = links.filter((link) => link.startsWith('/docs'))
	links = [...new Set(links)]

	const pages = []
	let pageIndex = 0
	const promises = links.map((link) => {
		return new Promise(async (resolve) => {
			const pg = await browser.newPage()
			await pg.goto(`https://highlight.io${link}`, {
				waitUntil: 'networkidle2',
				timeout: 0,
			})
			const contentHTML = await pg.evaluate(() => {
				return document.querySelector('[class^="Docs_pageTitle"] + div')
					.innerHTML
			})
			const breadcrumbs = await pg.evaluate(() => {
				return [
					...document.querySelectorAll(
						'[class^="Docs_breadcrumb__"]',
					),
				].map((el) => el.textContent)
			})
			const title = await pg.evaluate(() => {
				return document.querySelector('[class^="Docs_pageTitle"]')
					.textContent
			})

			console.log(`Finished ${title}: ${pageIndex++}/${links.length}`)
			pages.push({ link, title, breadcrumbs, contentHTML })
			resolve(undefined)
		})
	})

	await Promise.all(promises)
	await browser.close()

	writeFileSync('content.json', JSON.stringify(pages))
}

parseHighlightDocs()
