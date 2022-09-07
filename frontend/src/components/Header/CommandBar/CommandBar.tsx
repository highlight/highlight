import { useGetProjectSuggestionLazyQuery } from '@graph/hooks'
import { useParams } from '@util/react-router/useParams'
import React, { useEffect, useState } from 'react'
import CommandPalette, { Command } from 'react-command-palette'
import { RouteComponentProps } from 'react-router'
import { withRouter } from 'react-router-dom'

import { useAuthContext } from '../../../authentication/AuthContext'
import styles from './CommandBar.module.scss'
import {
	CommandWithoutId,
	getNavigationCommands,
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

const CommandPaletteComponent: React.FC<
	React.PropsWithChildren<RouteComponentProps>
> = ({ history }) => {
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
	const { project_id } = useParams<{
		project_id: string
	}>()
	const playerCommands = usePlayerCommands(isHighlightAdmin)

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
					history.push(`/${project?.id}/sessions`)
				},
			}
		}) ?? []

	const navigationCommands: CommandWithoutId[] = getNavigationCommands(
		project_id,
		history,
	)

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

export const CommandBar = withRouter(CommandPaletteComponent)
