import { useGetProjectSuggestionLazyQuery } from '@graph/hooks'
import React, { useEffect, useState } from 'react'
import CommandPalette, { Command } from 'react-command-palette'
import { useNavigate } from 'react-router-dom'

import { useAuthContext } from '../../../authentication/AuthContext'
import styles from './CommandBar.module.scss'
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
	const [normalizedWorkspaces, setNormalizedWorkspaces] = useState({})
	const [getProjects, { data }] = useGetProjectSuggestionLazyQuery({
		onCompleted: (data) => {
			if (data.workspaceSuggestion.length > 0) {
				setNormalizedWorkspaces(
					data.workspaceSuggestion.reduce((acc, cur) => {
						if (cur) {
							return {
								...acc,
								[cur.id]: cur?.name,
							}
						}
						return {
							...acc,
						}
					}, {}),
				)
			}
		},
	})
	const { isHighlightAdmin } = useAuthContext()
	const playerCommands = usePlayerCommands(isHighlightAdmin)
	const navigate = useNavigate()

	useEffect(() => {
		if (isHighlightAdmin) {
			getProjects({
				variables: { query: '' },
			})
		}
	}, [getProjects, isHighlightAdmin])

	const projectCommands: CommandWithoutId[] =
		data?.projectSuggestion?.map((project, index) => {
			return {
				category: 'Projects',
				id: project?.id ?? index,
				name: `${project?.name ?? index.toString()} - ${
					// @ts-expect-error
					normalizedWorkspaces[
						project?.workspace_id.toString() as string
					]
				}`,
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
			hotKeys={['command+k', 'ctrl+k']}
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
