declare module 'react-command-palette' {
	import * as React from 'react'

	export interface Command {
		name: string
		command: () => void
		id: number | string
		category: string
	}
	interface ReactCommandPaletteProps {
		trigger: React.ReactNode
		hotKeys: string[]
		open?: boolean
		highlightFirstSuggestion?: boolean
		closeOnSelect?: boolean
		onSelect?: any
		onChange?: any
		onHighlight?: any
		commands: Command[]
		renderCommand?: any
		options?: any
		theme?: any
		resetCommandsOnOpen?: boolean
		resetInputOnOpen?: boolean
		maxDisplayed?: number
		placeholder?: string
	}

	class ReactCommandPalette extends React.Component<ReactCommandPaletteProps> {
		static defaultProps?: ReactCommandPaletteProps
	}

	export default ReactCommandPalette
}
