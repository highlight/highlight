import { QuickStartContent } from '../QuickstartContent'
import { curlExample, verifyLogs } from './shared-snippets'

export const HTTPContent: QuickStartContent = {
	title: 'curl',
	subtitle: 'Set up highlight.io log ingestion via OTLP HTTP.',
	entries: [curlExample, verifyLogs],
}
