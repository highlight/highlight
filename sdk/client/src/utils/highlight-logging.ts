import { getItem, setItem } from './storage'

const HIGHLIGHT_LOGS_KEY = 'highlightLogs'

// Logs emitted from the highlight SDK itself. Use extremely sparingly!
// These will persist across sessions until they have been successfully uploaded
// (which is important for debugging issues related to poor network).
// Logs are newline delimited, so do not put newlines in your logtext.
export const logForHighlight = (logText: string) => {
	let highlightLogs = getItem(HIGHLIGHT_LOGS_KEY) || ''
	highlightLogs =
		highlightLogs + '[' + new Date().getTime() + '] ' + logText + '\n'
	setItem(HIGHLIGHT_LOGS_KEY, highlightLogs)
}

export const getHighlightLogs = (): string => {
	return getItem(HIGHLIGHT_LOGS_KEY) || ''
}

export const clearHighlightLogs = (logsToClear: string) => {
	if (!logsToClear) {
		return
	}
	let highlightLogs = getItem(HIGHLIGHT_LOGS_KEY) || ''
	if (!highlightLogs) {
		return
	}
	if (highlightLogs.startsWith(logsToClear)) {
		highlightLogs = highlightLogs.slice(logsToClear.length)
		setItem(HIGHLIGHT_LOGS_KEY, highlightLogs)
	} else {
		logForHighlight(
			'Unable to clear logs ' +
				logsToClear.replace('\n', ' ') +
				' from ' +
				highlightLogs.replace('\n', ' '),
		)
	}
}
