/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { vscodeLightInit } from '@uiw/codemirror-theme-vscode'
import {
	autocompletion,
	CompletionContext,
	acceptCompletion,
} from '@codemirror/autocomplete'
import { keymap } from '@codemirror/view'

import * as styles from './SqlEditor.css'

function completeSql(context: CompletionContext) {
	const word = context.matchBefore(/\w*/)

	const priorText = context.state.doc.toString().substring(0, context.pos)

	const orderedTokens = priorText
		.toLowerCase()
		.split(/\s+/)
		.filter((t) => t !== '')

	const mergedTokens = []
	// Handle "group by" and "order by" as a single token
	for (let i = 0; i < orderedTokens.length; i++) {
		const combinedToken = orderedTokens[i] + ' ' + orderedTokens[i + 1]
		if (keywords.includes(combinedToken)) {
			mergedTokens.push(combinedToken)
			i++
		} else {
			mergedTokens.push(orderedTokens[i])
		}
	}

	const lastToken = mergedTokens[mergedTokens.length - 1]
	const tokens = new Set(mergedTokens)
	const unusedKeywords: string[] = []
	let lastKeyword: string | undefined
	for (const k of keywords.toReversed()) {
		if (!tokens.has(k.toLowerCase())) {
			unusedKeywords.push(k)
		} else {
			lastKeyword = k
			break
		}
	}

	const filteredOperators = ['where', 'select'].includes(lastKeyword ?? '')
		? operators
		: []

	console.log('lastToken', lastToken)

	const filteredTables = ['from'].includes(lastToken ?? '') ? tables : []

	const keywordOptions = unusedKeywords.map((k) => ({
		label: k.toUpperCase(),
		type: 'keyword',
	}))

	const operatorOptions = filteredOperators.map((k) => ({
		label: k.toUpperCase(),
		type: 'keyword',
	}))

	const tableOptions = filteredTables.map((k) => ({
		label: k,
		type: 'text',
		boost: 2,
	}))

	const allOptions = keywordOptions
		.concat(operatorOptions)
		.concat(tableOptions)

	return {
		from: word?.from,
		options: allOptions,
	}
}

interface Props {
	value: string
	setValue: (value: string) => void
}

const tables = ['sessions', 'logs', 'traces', 'events', 'errors']

const keywords = [
	'select',
	'from',
	'where',
	'group by',
	'having',
	'order by',
	'limit',
	'offset',
]

const operators = ['and', 'or', 'not']

export const DEFAULT_SQL = [
	`SELECT`,
	`    $time_interval('1 hour'),`,
	`    concat('level: ', level),`,
	`    count()`,
	`FROM logs`,
	`GROUP BY 1, 2`,
].join('\n')

export const SqlEditor: React.FC<Props> = ({ value, setValue }: Props) => {
	const [valueInternal, setValueInternal] = React.useState(value)
	const onChange = React.useCallback((val: string) => {
		setValueInternal(val)
	}, [])

	const sqlLang = sql({
		// upperCaseKeywords: true,
		keywordCompletion: () => ({
			label: '',
			options: [],
		}),
	})

	return (
		<div className={styles.editorWrapper}>
			<CodeMirror
				basicSetup={{
					lineNumbers: false,
					foldGutter: false,
					highlightActiveLine: false,
					indentOnInput: false,
				}}
				width="100%"
				height="300px"
				value={valueInternal}
				extensions={[
					sqlLang,
					autocompletion(),
					sqlLang.language.data.of({
						autocomplete: completeSql,
					}),
					keymap.of([{ key: 'Tab', run: acceptCompletion }]),
				]}
				theme={vscodeLightInit({
					settings: {
						fontFamily:
							'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
					},
				})}
				onChange={onChange}
				onBlur={() => {
					setValue(valueInternal)
				}}
				indentWithTab={false}
			/>
		</div>
	)
}
