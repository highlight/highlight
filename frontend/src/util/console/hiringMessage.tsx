export const showHiringMessage = () => {
	printMessage('Come work with us! 👉 ')
}

function printMessage(displayText: string) {
	const consolePayload = {
		line: !!displayText,
		logo: [
			/Safari/.test(navigator.userAgent) &&
				/Apple Comp/.test(navigator.vendor),
			/Chrome/.test(navigator.userAgent) &&
				/Google Inc/.test(navigator.vendor),
		],
	}
	const textColor = 'inherit'
	const styles = `color: ${textColor}; font-size: 20px;`
	const imageHeight = 179
	const imageWidth = 817
	const image = 'https://i.imgur.com/ojmH91U.png'
	const message = {
		text: '%cWant to help build next-gen developer tools?',
		styles: [styles + '; font-weight: 900; margin-bottom: 12px;'],
		logo: {
			text: '%c %c',
			styles: [
				`font-size: 34px; margin-right: 0px; padding: ${
					imageHeight / 2
				}px ${imageWidth / 2}px ${imageHeight / 2}px ${
					imageWidth / 2
				}px; background: url("${image}") 0 50% / ${imageWidth / 2}px ${
					imageHeight / 2
				}px no-repeat;`,
				'',
			],
		},
		line: {
			text: '%c\n' + displayText + '%c https://careers.highlight.run\n ',
			styles: [
				`color: ${textColor}; font-style: italic; font-size: 1.5em; padding-bottom: 12px;`,
				'',
			],
		},
	}
	let r
	let o
	if (consolePayload.logo.indexOf(!0) >= 0) {
		let c
		;(message.text = '' + message.logo.text + message.text),
			(c = message.styles).unshift.apply(c, message.logo.styles)
	}
	if (consolePayload.line)
		(message.text += message.line.text),
			(o = message.styles).push.apply(o, message.line.styles)

	// @ts-ignore
	console.log.apply(r, ['\n' + message.text].concat(message.styles))
}
