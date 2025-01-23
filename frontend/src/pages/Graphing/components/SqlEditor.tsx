import React, { useRef, useEffect, useState } from 'react'
import * as monaco from 'monaco-editor'
import 'monaco-sql-languages/esm/languages/pgsql/pgsql.contribution'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker&inline'

self.MonacoEnvironment = {
	getWorker() {
		return new editorWorker()
	},
}

interface Props {
	value: string
	setValue: (value: string) => void
}

const keywords = [
	'SELECT',
	'FROM',
	'WHERE',
	'GROUP BY',
	'ORDER BY',
	'LIMIT',
	'OFFSET',
]

const operators = ['AND', 'OR', 'NOT']

monaco.languages.registerCompletionItemProvider('sql', {
	triggerCharacters: [' '],
	provideCompletionItems: function (model, position) {
		const word = model.getWordAtPosition(position) || {
			startColumn: position.column,
			endColumn: position.column,
		}
		return {
			suggestions: keywords
				.map((k) => ({
					kind: monaco.languages.CompletionItemKind.Keyword,
					label: k,
					insertText: k,
					range: {
						startLineNumber: position.lineNumber,
						endLineNumber: position.lineNumber,
						startColumn: word.startColumn,
						endColumn: word.endColumn,
					},
					sortText: `1_${k}`,
				}))
				.concat(
					operators.map((k) => ({
						kind: monaco.languages.CompletionItemKind.Operator,
						label: k,
						insertText: k,
						range: {
							startLineNumber: position.lineNumber,
							endLineNumber: position.lineNumber,
							startColumn: word.startColumn,
							endColumn: word.endColumn,
						},
						sortText: `2_${k}`,
					})),
				),
		}
	},
})

monaco.editor.defineTheme('highlightTheme', {
	base: 'vs',
	inherit: true,
	rules: [],
	colors: {
		'editor.background': '#FDFCFD',
	},
})

export const DEFAULT_SQL = [
	`SELECT`,
	`    $time_interval('1 hour'),`,
	`    concat('level: ', level),`,
	`    count()`,
	`FROM logs`,
	`GROUP BY 1, 2`,
].join('\n')

export const SqlEditor: React.FC<Props> = ({ value, setValue }: Props) => {
	const divEl = useRef<HTMLDivElement>(null)
	const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>()

	// Initial setup
	useEffect(() => {
		if (divEl.current) {
			const inner = monaco.editor.create(divEl.current, {
				value: value,
				language: 'sql',
				suggest: { selectionMode: 'always' },
				automaticLayout: true,
				lineNumbers: 'off',
				glyphMargin: false,
				minimap: { enabled: false },
				scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
				lineDecorationsWidth: 0,
				lineNumbersMinChars: 0,
				overviewRulerLanes: 0,
				folding: false,
				theme: 'highlightTheme',
				scrollBeyondLastLine: false,
			})

			setEditor(inner)

			return () => {
				inner.dispose()
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div
			style={{ width: '100%', height: '300px' }}
			className="Editor"
			ref={divEl}
			onBlur={() => {
				if (editor !== undefined) {
					setValue(editor.getValue())
				}
			}}
		></div>
	)
}
