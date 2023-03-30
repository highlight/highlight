import { QuickStartContent } from '../QuickstartContent'
import { curlExample, verifyLogs } from './shared-snippets'

export const HTTPContent: QuickStartContent = {
	title: 'OTLP HTTP',
	subtitle: 'Set up highlight.io log ingestion via OTLP HTTP.',
	entries: [curlExample, verifyLogs],
}
