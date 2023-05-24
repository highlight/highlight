import { QuickStartContent } from '../QuickstartContent'
import { curlExample, verifyLogs } from './shared-snippets'

export const FluentForwardContent: QuickStartContent = {
	title: 'curl',
	subtitle: 'Set up highlight.io log ingestion via FluentForward (fluentd / fluentbit protocol).',
	entries: [curlExample, verifyLogs],
}
