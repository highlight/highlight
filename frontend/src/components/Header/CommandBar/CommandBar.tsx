import { useGetProjectSuggestionQuery } from '@graph/hooks'
import React from 'react'
import CommandPalette, { Command } from 'react-command-palette'
import { useNavigate } from 'react-router-dom'

import { useAuthContext } from '../../../authentication/AuthContext'
import styles from './CommandBar.module.css'
import {
	CommandWithoutId,
	useNavigationCommands,
	usePlayerCommands,
} from './CommandBarCommands'
import CommandBarCommand from './components/CommandBarCommand'

const THEME = {
	container: styles.container,
	modal: styles.modal,
	overlay: 'atom-overlay',
	content: 'atom-content',
	containerOpen: 'atom-containerOpen',
	input: styles.input,
	inputOpen: 'atom-inputOpen',
	inputFocused: styles.inputFocused,
	spinner: 'atom-spinner',
	suggestionsContainer: 'atom-suggestionsContainer',
	suggestionsContainerOpen: styles.suggestionsContainerOpen,
	suggestionsList: 'atom-suggestionsList',
	suggestion: styles.suggestion,
	suggestionFirst: 'atom-suggestionFirst',
	suggestionHighlighted: styles.suggestionHighlighted,
	trigger: 'atom-trigger',
}

export const CommandBar: React.FC<React.PropsWithChildren> = () => {
	const { isHighlightAdmin } = useAuthContext()
	const { data } = useGetProjectSuggestionQuery({
		skip: !isHighlightAdmin,
		variables: { query: '' },
	})
	const playerCommands = usePlayerCommands(isHighlightAdmin)
	const navigate = useNavigate()

	const projectCommands: CommandWithoutId[] =
		data?.projectSuggestion?.map((project, index) => {
			return {
				category: 'Projects',
				id: project?.id ?? index,
				name: `${project?.name ?? index.toString()}`,
				command() {
					navigate(`/${project?.id}/sessions`)
				},
			}
		}) ?? []

	const navigationCommands: CommandWithoutId[] = useNavigationCommands()

	const commands: Command[] = [
		...playerCommands,
		...navigationCommands,
		...projectCommands,
	].map((command, index) => ({ ...command, id: index }))

	return (
		<CommandPalette
			trigger={<></>}
			hotKeys={['command+shift+k', 'ctrl+shift+k']}
			highlightFirstSuggestion={false}
			closeOnSelect
			commands={commands}
			renderCommand={CommandBarCommand}
			options={{ keys: ['name', 'category'] }}
			theme={THEME}
			resetInputOnOpen
			maxDisplayed={100}
			placeholder="What do you want to do?"
		/>
	)
}
