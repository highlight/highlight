import 'intro.js/introjs.css'

import { Tab } from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import useLocalStorage from '@rehooks/local-storage'
import { Step, Steps } from 'intro.js-react'
import React, { useState } from 'react'
import { BooleanParam, useQueryParam } from 'use-query-params'

import usePlayerConfiguration from '../PlayerHook/utils/usePlayerConfiguration'

const PlayerPageProductTour = () => {
	const [startTour] = useQueryParam('demo', BooleanParam)
	const [enableTour, setEnableTour] = useState(!!startTour)
	const [, setPlayerRightPanelActiveTab] = useLocalStorage(
		'tabs-PlayerRightPanel-active-tab',
		'',
	)
	const {
		setShowDevTools,
		setShowRightPanel,
		setSelectedDevToolsTab,
		setShowLeftPanel,
	} = usePlayerConfiguration()

	const steps: Step[] = [
		{
			// @ts-expect-error
			title: '👋 Welcome to Highlight!',
			intro: 'This is a demo of how to debug an error in your app.',
		},
		{
			// @ts-expect-error
			title: 'The Session Player',
			element: '.replayer-wrapper',
			intro: (
				<>
					<span>
						You can see everything the user has done during the
						session.{' '}
						<b>
							You don't need to ask your users for repro steps
							anymore!
						</b>
					</span>
				</>
			),
		},
		{
			// @ts-expect-error
			title: 'The Events',
			element: `#${PlayerPageProductTourSelectors.PlayerRightPanel}`,
			intro: 'Here you can see all events that happened in the app.',
		},
		{
			// @ts-expect-error
			title: 'The Metadata',
			element: `#${PlayerPageProductTourSelectors.PlayerRightPanel}`,
			intro: 'Here you can see metadata for the session provided by Highlight and provided by you.',
		},
		{
			// @ts-expect-error
			title: 'The DevTools',
			element: `#${PlayerPageProductTourSelectors.DevToolsButton}`,
			intro: 'Highlight gives you the tools you are familiar with to debug locally to debug real user sessions.',
		},
		{
			// @ts-expect-error
			title: 'Errors',
			element: `#${PlayerPageProductTourSelectors.DevToolsPanel}`,
			intro: 'You can see Javascript errors here along with their call stacks and descriptions.',
		},
		{
			// @ts-expect-error
			title: 'Console Messages',
			element: `#${PlayerPageProductTourSelectors.DevToolsPanel}`,
			intro: 'You can see everything printed to the console here.',
		},
		{
			// @ts-expect-error
			title: 'Network',
			element: `#${PlayerPageProductTourSelectors.DevToolsPanel}`,
			intro: 'You can see all network requests here. If you enable recording headers and bodies, you will see that here too.',
		},
		{
			// @ts-expect-error
			title: 'Start debugging faster',
			intro: (
				<>
					<span>SOME COPY</span>
				</>
			),
		},
	]

	return (
		<Steps
			onStart={() => {
				setEnableTour(true)
				setShowDevTools(false)
				setPlayerRightPanelActiveTab('Events')
				setShowRightPanel(true)
				setShowLeftPanel(false)
				setSelectedDevToolsTab(Tab.Errors)
			}}
			enabled={enableTour}
			steps={steps}
			options={{ doneLabel: 'Start Debugging' }}
			initialStep={0}
			onExit={() => {
				setEnableTour(false)
			}}
			onBeforeChange={(nextStepIndex) => {
				switch (nextStepIndex) {
					case 2:
						setShowRightPanel(true)
						setPlayerRightPanelActiveTab('Events')
						break
					case 3:
						setShowRightPanel(true)
						setPlayerRightPanelActiveTab('Metadata')
						break
					case 5:
						setShowDevTools(true)
						break
					case 6:
						setShowDevTools(true)
						setSelectedDevToolsTab(Tab.Console)
						break
					case 7:
						setShowDevTools(true)
						setSelectedDevToolsTab(Tab.Network)
						break
				}
			}}
		/>
	)
}

export default PlayerPageProductTour

export enum PlayerPageProductTourSelectors {
	DevToolsButton = 'DevToolsButton',
	DevToolsPanel = 'DevToolsPanel',
	PlayerRightPanel = 'PlayerRightPanel',
}
