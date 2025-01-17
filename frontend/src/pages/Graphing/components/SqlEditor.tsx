import React, { useRef, useEffect, useState } from 'react'
import * as monaco from 'monaco-editor'

// @ts-ignore
self.MonacoEnvironment = {
	getWorkerUrl: function (_moduleId: any, label: string) {
		if (label === 'json') {
			return './json.worker.bundle.js'
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return './css.worker.bundle.js'
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return './html.worker.bundle.js'
		}
		if (label === 'typescript' || label === 'javascript') {
			return './ts.worker.bundle.js'
		}
		return './editor.worker.bundle.js'
	},
}

interface Props {
	setValue: (value: string) => void
}

export const SqlEditor: React.FC<Props> = ({ setValue }: Props) => {
	const divEl = useRef<HTMLDivElement>(null)
	const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>()
	useEffect(() => {
		if (divEl.current) {
			const inner = monaco.editor.create(divEl.current, {
				value: [
					`SELECT concat('hey ', level), count(), max(timestamp)`,
					`FROM logs`,
					`GROUP BY 1`,
				].join('\n'),
				language: 'sql',
				automaticLayout: true,
				lineNumbers: 'off',
				minimap: { enabled: false },
				scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
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
			style={{ width: '100%', height: '400px' }}
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
