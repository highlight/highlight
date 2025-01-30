import { QuickStartContent } from '../QuickstartContent'
import {
	curlExample,
	curlExampleRaw,
	verifyLogs,
} from './shared-snippets-logging'

export const HTTPReorganizedContent: QuickStartContent = {
	title: 'Shipping logs over HTTPS with curl',
	subtitle: 'Set up highlight.io log ingestion over HTTPS.',
	products: ['Logs'],
	entries: [curlExampleRaw, curlExample, verifyLogs],
}
