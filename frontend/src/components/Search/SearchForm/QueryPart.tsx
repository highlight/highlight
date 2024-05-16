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
	typeaheadOpen: boolean
	cursorIndex: number
	index: number
	tokenGroup: TokenGroup
	showValues: boolean
	showErrors: boolean
	onRemoveItem?: (index: number) => void
}> = ({
	typeaheadOpen,
	cursorIndex,
	index,
	tokenGroup,
	showValues,
	showErrors,
	onRemoveItem,
}) => {
	const active =
		typeaheadOpen &&
		cursorIndex >= tokenGroup.start &&
		cursorIndex <= tokenGroup.stop + 1
	const errorToken = tokenGroup.tokens.find(
		(token) => (token as any).errorMessage !== undefined,
	)
	const error = errorToken
		? errorMessageForToken(errorToken, showValues)
		: undefined
	const showError = showErrors && error
	const isExpression = tokenGroup.type === 'expression'

	if (
		tokenGroup.tokens.length === 1 &&
		tokenGroup.tokens[0].type === SearchGrammarParser.EOF
	) {
		return null
	}

	if (tokenGroup.type === 'separator') {
		return (
			<>
				{tokenGroup.tokens.map((token, index) => {
					return (
						<Token
							key={`${token.text}-${index}`}
							token={token}
							showErrors={showErrors}
						/>
					)
				})}
			</>
		)
	}

	return (
		<>
			<Tooltip
				placement="top-start"
				open={active && !!showError}
				style={{ display: 'inline', wordBreak: 'break-word' }}
				maxWidth={600}
				shift={-3}
				trigger={
					<Box
						as="span"
						cssClass={clsx({
							[styles.comboboxTag]: isExpression,
							[styles.comboboxTagActive]: active && isExpression,
							[styles.comboboxTagError]: !!showError,
						})}
						position="relative"
						display="inline-flex"
					>
						{tokenGroup.tokens.map((token, index) => {
							if (token.type === SearchGrammarParser.EOF) {
								return null
							}

							return (
								<Token
									key={`${token.text}-${index}`}
									token={token}
									showErrors={showErrors}
								/>
							)
						})}
						{onRemoveItem && (
							<IconSolidXCircle
								className={styles.comboboxTagClose}
								size={13}
								onClick={() => onRemoveItem(index)}
								style={{ cursor: 'pointer' }}
							/>
						)}

						{showError && (
							<IconSolidExclamationCircle
								className={styles.comboboxTagErrorIndicator}
								size={13}
								style={{ cursor: 'pointer' }}
							/>
						)}
					</Box>
				}
			>
				{showError ? <ErrorRenderer error={error} /> : null}
			</Tooltip>
		</>
	)
}

export const SEPARATORS = SearchGrammarParser.literalNames.map((name) =>
	name?.replaceAll("'", ''),
)

export const Token = ({
	showErrors,
	token,
}: {
	showErrors?: boolean
	token: SearchToken
}): JSX.Element => {
	const { errorMessage, text } = token
	const showError = showErrors && errorMessage

	if (SEPARATORS.includes(text.toUpperCase())) {
		return (
			<Box
				as="span"
				cssClass={clsx(styles.token, {
					[styles.errorToken]: !!showError,
				})}
				style={{ color: '#E93D82', zIndex: 1 }}
			>
				{text}
			</Box>
		)
	} else {
		return (
			<Box as="span" style={{ zIndex: 1 }} cssClass={clsx(styles.token)}>
				{text.split('').map((char, index) =>
					char === '*' ? (
						<span key={index} style={{ color: '#E93D82' }}>
							{char}
						</span>
					) : (
						char
					),
				)}
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

const OPERATOR_CHARACTERS = ['!', '<', '>', '=', ':']
const AND_OR_CHARACTERS = ['AND', 'OR']

const errorMessageForToken = (
	token: SearchToken,
	showValues: boolean,
): string | undefined => {
	if (!token || token.type === SearchGrammarParser.EOF) {
		return undefined
	}

	let error = token.errorMessage
	if (!error) {
		return undefined
	}

	if (
		OPERATOR_CHARACTERS.some(
			(char) =>
				error!.startsWith(`extraneous input '${char}'`) ||
				error!.startsWith(`mismatched input '${char}'`),
		)
	) {
		error = 'Operators must be wrapped in quotes.'
	} else if (
		AND_OR_CHARACTERS.some(
			(char) =>
				error!.startsWith(`extraneous input '${char}'`) ||
				error!.startsWith(`mismatched input '${char}'`),
		)
	) {
		error = `AND and OR must be used between expressions.`
	} else if (
		error.endsWith("expecting ')'") ||
		error.startsWith("missing ')'")
	) {
		error = 'Missing closing parenthesis.'
	} else if (
		error.startsWith("mismatched input '\"'") ||
		error.startsWith("extraneous input '\"' expecting")
	) {
		error = 'Missing closing quote.'
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
