import { QuickStartContent } from '../QuickstartContent'
import { curlExample, curlExampleRaw, verifyLogs } from './shared-snippets'

export const HTTPContent: QuickStartContent = {
	title: 'Shipping logs over HTTPS with curl',
	subtitle: 'Set up highlight.io log ingestion over HTTPS.',
	entries: [curlExampleRaw, curlExample, verifyLogs],
}
