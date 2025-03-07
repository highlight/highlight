/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback } from 'react'
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
import { indentWithTab } from '@codemirror/commands'
import { linter, Diagnostic } from '@codemirror/lint'

import { useGetKeysLazyQuery } from '@/graph/generated/hooks'
import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { useProjectId } from '@/hooks/useProjectId'
import moment from 'moment'
import {
	TIME_INTERVAL_MACRO,
	TIMESTAMP_KEY,
} from '@/pages/Graphing/components/Graph'
import { useGraphContext } from '@/pages/Graphing/context/GraphContext'
import {
	MetricAggregator,
	MetricExpression,
	ProductType,
} from '@/graph/generated/schemas'
import { BUCKET_FREQUENCIES } from '@/pages/Graphing/util'
import { GraphSettings } from '@/pages/Graphing/constants'

import * as styles from './SqlEditor.css'

interface Props {
	value: string
	setValue: (value: string) => void
	startDate: Date
	endDate: Date
}

const tables = ['sessions', 'logs', 'traces', 'events', 'errors', 'metrics']

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

export const DEFAULT_ALERT_SQL = [
	`SELECT`,
	`\tconcat('level: ', level),`,
	`\tcount()`,
	`FROM logs`,
	`GROUP BY 1`,
].join('\n')

const expressionToSql = (expr: MetricExpression) => {
	let columnStr = expr.column
	if (columnStr.includes('.')) {
		columnStr = `"${columnStr}"`
	}

	switch (expr.aggregator) {
		case MetricAggregator.Sum:
			return `sum(toFloat64OrNull(${columnStr}))`
		case MetricAggregator.Avg:
			return `avg(toFloat64OrNull(${columnStr}))`
		case MetricAggregator.Min:
			return `min(toFloat64OrNull(${columnStr}))`
		case MetricAggregator.Max:
			return `max(toFloat64OrNull(${columnStr}))`
		case MetricAggregator.Count:
			return 'count()'
		case MetricAggregator.CountDistinct:
			return `uniqExact(${columnStr})`
		case MetricAggregator.P50:
			return `quantile(0.50)(toFloat64OrNull(${columnStr}))`
		case MetricAggregator.P90:
			return `quantile(0.90)(toFloat64OrNull(${columnStr}))`
		case MetricAggregator.P95:
			return `quantile(0.95)(toFloat64OrNull(${columnStr}))`
		case MetricAggregator.P99:
			return `quantile(0.99)(toFloat64OrNull(${columnStr}))`
	}
}

const productTypeToTable = (productType: ProductType) => {
	switch (productType) {
		case ProductType.Sessions:
			return 'sessions'
		case ProductType.Logs:
			return 'logs'
		case ProductType.Traces:
			return 'traces'
		case ProductType.Events:
			return 'events'
		case ProductType.Errors:
			return 'errors'
		case ProductType.Metrics:
			return 'metrics'
	}
}

const frequencyToName = Object.fromEntries(
	BUCKET_FREQUENCIES.map((f) => [f.value, f.name]),
)

const bucketByExpr = (
	bucketByEnabled: boolean,
	bucketBySetting: 'Interval' | 'Count',
	bucketByKey: string,
	bucketCount: number,
	bucketInterval: number,
	startDate: Date,
	endDate: Date,
) => {
	if (!bucketByEnabled) {
		return undefined
	}

	switch (bucketBySetting) {
		case 'Interval':
			return `$time_interval('${frequencyToName[bucketInterval] ?? '1 hour'}')`
		case 'Count':
			if (bucketByKey !== TIMESTAMP_KEY) {
				return undefined
			}
			const startUnix = Math.floor(startDate.getTime() / 1000)
			const endUnix = Math.floor(endDate.getTime() / 1000)
			const bucketSeconds = Math.ceil((endUnix - startUnix) / bucketCount)
			return `fromUnixTimestamp(intDiv(toUnixTimestamp(timestamp) - ${startUnix}, ${bucketSeconds}) * ${bucketSeconds} + ${startUnix})`
	}
}

export const convertSettingsToSql = (
	settings: GraphSettings,
	startDate: Date,
	endDate: Date,
) => {
	const {
		productType,
		query,
		groupByEnabled,
		groupByKeys,
		bucketByEnabled,
		bucketBySetting,
		bucketByKey,
		bucketCount,
		bucketInterval,
		expressions,
	} = settings

	const bucketExpr = bucketByExpr(
		bucketByEnabled,
		bucketBySetting,
		bucketByKey,
		bucketCount,
		bucketInterval,
		startDate,
		endDate,
	)

	const groupingExprs = [
		...(groupByEnabled ? groupByKeys : []),
		bucketExpr,
	].filter((e) => e !== undefined)

	const groupByExpr = groupingExprs
		.map((_, i) => (i + 1).toString())
		.join(', ')

	const selectExprs = [
		...groupingExprs,
		...expressions.map((e) => expressionToSql(e)),
	]

	let sql = `SELECT ${selectExprs.join(',\n\t')}\nFROM ${productTypeToTable(productType)}`
	if (query) {
		sql += `\nWHERE ${query}`
	}
	if (groupByExpr) {
		sql += `\nGROUP BY ${groupByExpr}`
		sql += `\nORDER BY ${groupByExpr}`
		sql += `\nLIMIT 10000`
	}

	return sql
}

export const SqlEditor: React.FC<Props> = ({
	value,
	setValue,
	startDate,
	endDate,
}: Props) => {
	const { errors, setErrors } = useGraphContext()

	const { projectId } = useProjectId()

	const [getKeys] = useGetKeysLazyQuery({
		variables: {
			project_id: projectId,
			date_range: {
				start_date: moment(startDate).format(TIME_FORMAT),
				end_date: moment(endDate).format(TIME_FORMAT),
			},
		},
	})

	const completeSql = useCallback(
		(context: CompletionContext) => {
			const word = context.matchBefore(/\w*/)

			const priorText = context.state.doc
				.toString()
				.substring(0, word?.from)

			const orderedTokens = priorText
				.toLowerCase()
				.split(/\s+/)
				.filter((t) => t !== '')

			const mergedTokens = []
			// Handle "group by" and "order by" as a single token
			for (let i = 0; i < orderedTokens.length; i++) {
				const combinedToken =
					orderedTokens[i] + ' ' + orderedTokens[i + 1]
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

			const filteredTables = ['from'].includes(lastToken ?? '')
				? tables
				: []

			const functionCompletions: Completion[] = [
				'select',
				'where',
				'group by',
				'order by',
				'having',
			].includes(lastKeyword ?? '')
				? functionTemplates.map((t) => {
						return snippetCompletion(t, {
							label: t.split('(')[0],
							type: 'function',
							boost: 4,
						})
					})
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

			return getKeys({
				variables: {
					project_id: projectId,
					date_range: {
						start_date: moment(startDate).format(TIME_FORMAT),
						end_date: moment(endDate).format(TIME_FORMAT),
					},
					query: word?.text,
				},
			}).then((result) => {
				const columnCompletions: Completion[] = [
					'select',
					'where',
					'group by',
					'order by',
					'having',
				].includes(lastKeyword ?? '')
					? (result.data?.keys.map((k) => ({
							label: k.name,
							type: 'text',
							boost: 3,
						})) ?? [])
					: []

				const allOptions = keywordCompletions
					.concat(tableCompletions)
					.concat(columnCompletions)
					.concat(functionCompletions)

				return {
					from: word?.from,
					options: allOptions,
				}
			})
		},
		[endDate, getKeys, projectId, startDate],
	)

	const sqlLang = sql({
		keywordCompletion: () => ({
			label: '',
			options: [],
		}),
	})

	const backendErrorLinter = linter((view: EditorView) => {
		const diagnostics: Diagnostic[] = []
		for (const e of errors) {
			const matches = /^line (\d+):(\d+).*?(\^+)\n$/s.exec(e)
			const lineStr = matches?.at(1)
			const columnStr = matches?.at(2)
			const length = matches?.at(3)?.length
			if (
				lineStr !== undefined &&
				columnStr !== undefined &&
				length !== undefined
			) {
				const line = view.state.doc.line(parseInt(lineStr) + 1)
				const column = parseInt(columnStr)
				const from = line.from + column
				const to = from + length
				diagnostics.push({
					from,
					to,
					severity: 'error',
					message: e,
				})
			} else {
				diagnostics.push({
					from: 0,
					to: view.state.doc.length,
					severity: 'error',
					message: e,
				})
			}
		}

		return diagnostics
	})

	return (
		<div className={styles.editorWrapper}>
			<CodeMirror
				basicSetup={{
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
					backendErrorLinter,
					EditorView.lineWrapping,
					keymap.of([
						{ key: 'Tab', run: acceptCompletion },
						indentWithTab,
					]),
				]}
				theme={vscodeLightInit({
					settings: {
						background: '#00000000',
						fontFamily:
							'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
					},
				})}
				onChange={(val) => {
					// Clear any existing errors after updating
					setErrors([])
					setValue(val)
				}}
				indentWithTab={false}
			/>
		</div>
	)
}
