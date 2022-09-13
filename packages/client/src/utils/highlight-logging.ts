const HIGHLIGHT_LOGS_KEY = 'highlightLogs'

// Logs emitted from the highlight SDK itself. Use extremely sparingly!
// These will persist across sessions until they have been successfully uploaded
// (which is important for debugging issues related to poor network).
// Logs are newline delimited, so do not put newlines in your logtext.
export const logForHighlight = (logText: string) => {
	let highlightLogs = window.localStorage.getItem(HIGHLIGHT_LOGS_KEY) || ''
	highlightLogs =
		highlightLogs + '[' + new Date().getTime() + '] ' + logText + '\n'
	window.localStorage.setItem(HIGHLIGHT_LOGS_KEY, highlightLogs)
}

export const getHighlightLogs = (): string => {
	return window.localStorage.getItem(HIGHLIGHT_LOGS_KEY) || ''
}

export const clearHighlightLogs = (logsToClear: string) => {
	if (!logsToClear) {
		return
	}
	let highlightLogs = window.localStorage.getItem(HIGHLIGHT_LOGS_KEY) || ''
	if (!highlightLogs) {
		return
	}
	if (highlightLogs.startsWith(logsToClear)) {
		highlightLogs = highlightLogs.slice(logsToClear.length)
		window.localStorage.setItem(HIGHLIGHT_LOGS_KEY, highlightLogs)
	} else {
		logForHighlight(
			'Unable to clear logs ' +
				logsToClear.replace('\n', ' ') +
				' from ' +
				highlightLogs.replace('\n', ' '),
		)
	}
}
