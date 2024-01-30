import {
	Box,
	IconSolidExclamationCircle,
	IconSolidXCircle,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import clsx from 'clsx'

import SearchGrammarParser from '@/components/Search/Parser/antlr/SearchGrammarParser'
import { TokenGroup } from '@/components/Search/SearchForm/utils'
import { SearchToken } from '@/components/Search/utils'

import * as styles from './SearchForm.css'

export const QueryPart: React.FC<{
	cursorIndex: number
	index: number
	tokenGroup: TokenGroup
	showValues: boolean
	onRemoveItem: (index: number) => void
}> = ({ cursorIndex, index, tokenGroup, showValues, onRemoveItem }) => {
	const active =
		cursorIndex >= tokenGroup.start && cursorIndex <= tokenGroup.stop + 1
	const errorToken = tokenGroup.tokens.find(
		(token) => (token as any).errorMessage !== undefined,
	)
	const error = errorToken
		? errorMessageForToken(errorToken, showValues)
		: undefined

	if (
		tokenGroup.tokens.length === 1 &&
		tokenGroup.tokens[0].type === SearchGrammarParser.EOF
	) {
		return null
	}

	if (tokenGroup.type !== 'expression') {
		return (
			<>
				{tokenGroup.tokens.map((token, index) => {
					const { text } = token
					const key = `${text}-${index}`

					return <Token key={key} text={text} />
				})}
			</>
		)
	}

	return (
		<>
			<Tooltip
				placement="bottom"
				open={active && !!error}
				trigger={
					<Box
						cssClass={clsx(styles.comboboxTag, {
							[styles.comboboxTagActive]: active,
							[styles.comboboxTagError]: !!error,
						})}
						py="6"
						position="relative"
						whiteSpace="nowrap"
					>
						<IconSolidXCircle
							className={styles.comboboxTagClose}
							size={13}
							onClick={() => onRemoveItem(index)}
						/>

						{error && (
							<IconSolidExclamationCircle
								className={styles.comboboxTagErrorIndicator}
								size={13}
							/>
						)}

						{tokenGroup.tokens.map((token, index) => {
							const { text, type } = token
							const key = `${text}-${index}`

							if (type === SearchGrammarParser.EOF) {
								return null
							}

							return <Token key={key} text={text} />
						})}

						<Box cssClass={styles.comboboxTagBackground} />
					</Box>
				}
			>
				{error ? <ErrorRenderer error={error} /> : null}
			</Tooltip>
		</>
	)
}

export const SEPARATORS = SearchGrammarParser.literalNames.map((name) =>
	name?.replaceAll("'", ''),
)

export const Token = ({ text }: { text: string }): JSX.Element => {
	const cssClass = text.trim() === '' ? styles.whitspaceTag : ''

	if (SEPARATORS.includes(text.toUpperCase())) {
		return <Box style={{ color: '#E93D82', zIndex: 1 }}>{text}</Box>
	} else {
		return (
			<Box style={{ zIndex: 1 }} cssClass={cssClass}>
				{text}
			</Box>
		)
	}
}

const ErrorRenderer: React.FC<{ error: string }> = ({ error }) => {
	return (
		<Box p="4">
			<Text>{error}</Text>
		</Box>
	)
}

const errorMessageForToken = (
	token: SearchToken & { errorMessage?: string },
	showValues: boolean,
): string | undefined => {
	if (!token || token.type === SearchGrammarParser.EOF) {
		return undefined
	}

	let error = token.errorMessage
	if (!error) {
		return undefined
	}

	if (error.endsWith("expecting ')'") || error.startsWith("missing ')'")) {
		error = 'Missing closing parenthesis'
	} else if (
		error.startsWith("mismatched input '\"'") ||
		error.startsWith("extraneous input '\"' expecting")
	) {
		error = 'Missing closing quote'
	} else if (
		(error.startsWith('mismatched input') ||
			error.startsWith('extraneous input')) &&
		error.endsWith('expecting <EOF>')
	) {
		if (showValues) {
			error =
				'Must wrap search value in quotes to use special characters.'
		} else {
			return ''
		}
	} else if (error.startsWith("mismatched input '<EOF>' expecting")) {
		// Swallow this error. It's becuase they have entered an operator and
		// there's no value yet.
		return ''
	}

	return error
}
