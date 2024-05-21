import { toast } from '@components/Toaster'

export const snakeCaseString = (string: string) => {
	return string
		.replace(/\W+/g, ' ')
		.split(/ |\B(?=[A-Z])/)
		.map((word) => word.toLowerCase())
		.join('_')
}

export const titleCaseString = (string: string) => {
	return string.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
	})
}

export const getDisplayNameFromEmail = (email: string) => {
	if (!email.includes('@')) {
		return email
	}
	return titleCaseString(email.split('@')[0])
}

export const validateEmail = (email: string) => {
	// https://stackoverflow.com/a/46181
	return !!email.match(
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-\d]+\.)+[a-zA-Z]{2,}))$/,
	)
}

export function* splitTaggedUsers(
	text: string,
): Generator<{ matched: boolean; value: string }> {
	// Conversation names can only contain lowercase letters,
	// numbers, hyphens, periods, and underscores (and spaces in admin names)
	const m = text.split(/@+(\[@?#?[\w\d-._\s]+])\([\w\d-._\s]+\)/)
	for (const piece of m) {
		if (piece.match(/\[(.+)]/)) {
			yield {
				matched: true,
				value: piece.replace(/\[(.+)]/, (_, p1) => p1),
			}
		} else {
			yield {
				matched: false,
				value: piece,
			}
		}
	}
}

export const bytesToPrettyString = (
	bytes: number,
	use1024 = false,
	decimalPoints = 1,
) => {
	const thresh = use1024 ? 1000 : 1024

	if (Math.abs(bytes) < thresh) {
		return bytes + ' B'
	}

	const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	let u = -1
	const r = 10 ** decimalPoints

	do {
		bytes /= thresh
		++u
	} while (
		Math.round(Math.abs(bytes) * r) / r >= thresh &&
		u < units.length - 1
	)

	return bytes.toFixed(decimalPoints) + ' ' + units[u]
}

export function parseOptionalJSON(text: string): any {
	let parsed: any = text
	try {
		const json = JSON.parse(text)
		if (typeof json === 'object') {
			parsed = json
		}
	} catch {
		parsed = text
	}
	return parsed
}

interface CopyToClipboardOptions {
	maxWidth?: number
	onCopyText?: string
}

export function copyToClipboard(
	text: string,
	options?: CopyToClipboardOptions,
) {
	navigator.clipboard.writeText(text)
	const maxWidth = options?.maxWidth ?? 80
	if (!!options?.onCopyText) {
		toast.success(options.onCopyText)
	} else {
		toast.success(
			`'${
				text.length > maxWidth ? `${text.slice(0, maxWidth)}...` : text
			}' copied to clipboard.`,
		)
	}
}
