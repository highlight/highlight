/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { vscodeLightInit } from '@uiw/codemirror-theme-vscode'
import {
	autocompletion,
	CompletionContext,
	acceptCompletion,
	Completion,
	snippetCompletion,
} from '@codemirror/autocomplete'
import { EditorView, keymap } from '@codemirror/view'

import * as styles from './SqlEditor.css'
import { useGetKeysQuery } from '@/graph/generated/hooks'
import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { useProjectId } from '@/hooks/useProjectId'
import moment from 'moment'
import { TIME_INTERVAL_MACRO } from '@/pages/Graphing/components/Graph'

interface Props {
	value: string
	setValue: (value: string) => void
	startDate: Date
	endDate: Date
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

const functionTemplates = [
	TIME_INTERVAL_MACRO + "('${duration}')",
	'sum(${expr})',
	'avg(${expr})',
	'min(${expr})',
	'max(${expr})',
	'count()',
	'quantile(${level})(${expr})',
]

export const DEFAULT_SQL = [
	`SELECT`,
	`    $time_interval('1 hour'),`,
	`    concat('level: ', level),`,
	`    count()`,
	`FROM logs`,
	`GROUP BY 1, 2`,
].join('\n')

export const SqlEditor: React.FC<Props> = ({
	value,
	setValue,
	startDate,
	endDate,
}: Props) => {
	const { projectId } = useProjectId()

	const { data } = useGetKeysQuery({
		variables: {
			project_id: projectId,
			date_range: {
				start_date: moment(startDate).format(TIME_FORMAT),
				end_date: moment(endDate).format(TIME_FORMAT),
			},
		},
	})

	const completeSql = (context: CompletionContext) => {
		const word = context.matchBefore(/\w*/)

		const priorText = context.state.doc.toString().substring(0, word?.from)

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

		const filteredTables = ['from'].includes(lastToken ?? '') ? tables : []

		const functionCompletions: Completion[] = ['select'].includes(
			lastKeyword ?? '',
		)
			? functionTemplates.map((t) => {
					return snippetCompletion(t, {
						label: t.split('(')[0],
						type: 'function',
						boost: 4,
					})
				})
			: []

		const columnCompletions: Completion[] = ['select'].includes(
			lastKeyword ?? '',
		)
			? (data?.keys.map((k) => ({
					label: k.name,
					type: 'text',
					boost: 3,
				})) ?? [])
			: []

		const keywordCompletions: Completion[] = unusedKeywords
			.map((k) => ({
				label: k.toUpperCase(),
				type: 'keyword',
			}))
			.filter((k) => {
				return word?.text !== ''
			})

		const tableCompletions: Completion[] = filteredTables.map((k) => ({
			label: k,
			type: 'text',
			boost: 2,
		}))

		const allOptions = keywordCompletions
			.concat(tableCompletions)
			.concat(columnCompletions)
			.concat(functionCompletions)

		return {
			from: word?.from,
			options: allOptions,
		}
	}

	const sqlLang = sql({
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
				value={value}
				extensions={[
					sqlLang,
					autocompletion(),
					sqlLang.language.data.of({
						autocomplete: completeSql,
					}),
					keymap.of([{ key: 'Tab', run: acceptCompletion }]),
					EditorView.lineWrapping,
				]}
				theme={vscodeLightInit({
					settings: {
						background: '#00000000',
						fontFamily:
							'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
					},
				})}
				onChange={setValue}
				indentWithTab={false}
			/>
		</div>
	)
}
