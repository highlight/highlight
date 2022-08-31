import _ from 'lodash'

import { Maybe } from '../../../../../graph/generated/schemas'

export const parseErrorDescription = (
	_text: Maybe<string>[] | undefined,
): string => {
	if (!_text) {
		return ''
	}

	return parseErrorDescriptionList(_text).join('')
}

export const parseErrorDescriptionList = (
	_text: Maybe<string>[] | undefined,
): string[] => {
	if (!_text) {
		return []
	}
	const text = _.cloneDeep(_text)
	const result: string[] = []
	let index = 0

	while (index < text.length) {
		let currentLine = text[index] as string
		if (!currentLine) {
			break
		}
		/**
		 * The specifier %s used to interpolate values in a console.(log|info|etc.) call.
		 * https://developer.mozilla.org/en-US/docs/Web/API/Console#Using_string_substitutions
		 */
		const specifierCount = (currentLine.match(/\%s/g) || []).length
		if (specifierCount === 0) {
			result.push(currentLine)
			index++
		} else {
			let offset = 1
			while (offset <= specifierCount) {
				const nextToken = text[index + offset] as string
				currentLine = currentLine.replace('%s', nextToken)
				offset++
			}
			result.push(currentLine)
			index += specifierCount + 1
		}
	}

	return result
}
