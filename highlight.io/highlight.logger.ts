import pino from 'pino'
import { createWriteStream } from 'pino-http-send'

export const getLogger = () => {
	const stream = createWriteStream({
		url: 'https://pub.highlight.io/v1/logs/json?project=4d7k1xeo&service=highlight-io-next-frontend',
	})

	return pino({ level: 'trace' }, stream)
}
