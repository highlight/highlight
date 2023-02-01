import GoToButton from '@components/Button/GoToButton'
import LoadingBox from '@components/LoadingBox'
import Tabs from '@components/Tabs/Tabs'
import { ErrorObject } from '@graph/schemas'
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { useResourcesContext } from '@pages/Player/ResourcesContext/ResourcesContext'
import ErrorModal from '@pages/Player/Toolbar/DevToolsWindow/ErrorsPage/components/ErrorModal/ErrorModal'
import { getNetworkResourcesDisplayName } from '@pages/Player/Toolbar/DevToolsWindow/Option/Option'
import ResourceDetailsModal from '@pages/Player/Toolbar/DevToolsWindow/ResourcePage/components/ResourceDetailsModal/ResourceDetailsModal'
import {
	findResourceWithMatchingHighlightHeader,
	getHighlightRequestId,
	NetworkResource,
} from '@pages/Player/Toolbar/DevToolsWindowV2/utils'
import { MillisToMinutesAndSeconds } from '@util/time'
import { message } from 'antd'
import React, { useCallback } from 'react'

import styles from './ResourceOrErrorDetailPanel.module.scss'

type Props = {
	resource?: NetworkResource
	error?: ErrorObject
}

const ResourceOrErrorDetailPanelContent = ({ resource, error }: Props) => {
	const { pause, session, sessionMetadata } = useReplayerContext()
	const { errors, isPlayerReady } = useReplayerContext()
	const { resources, loadResources, resourcesLoading } = useResourcesContext()

	if (!isPlayerReady || resourcesLoading) {
		return <LoadingBox />
	}

	const requestId = getHighlightRequestId(resource)
	if (
		resource !== undefined &&
		error === undefined &&
		requestId !== undefined
	) {
		error = errors.find((e) => e.request_id == requestId)
	}

	let requestNotFound = false
	if (error !== undefined && resource === undefined && error.request_id) {
		loadResources()
		resource = findResourceWithMatchingHighlightHeader(
			error.request_id!,
			// @ts-expect-error
			resources,
		)
		requestNotFound = resource === undefined
	}

	return (
		<Tabs
			className={styles.tabsWrapper}
			noPadding
			noHeaderPadding
			tabs={[
				...(resource
					? [
							{
								key: 'Request',
								panelContent: (
									<ResourceDetailsModal
										selectedNetworkResource={resource}
										networkRecordingEnabledForSession={
											session?.enable_recording_network_contents ||
											false
										}
									/>
								),
							},
					  ]
					: []),
				...(error
					? [
							{
								key: 'Error',
								title: (
									<div>
										Error
										{resource ? (
											<div
												className={
													styles.errorNotification
												}
											>
												<div
													className={
														styles.errorCount
													}
												>
													1
												</div>
											</div>
										) : null}
									</div>
								),
								panelContent: (
									<ErrorModal
										error={error}
										showRequestAlert={requestNotFound}
									/>
								),
							},
					  ]
					: []),
			]}
			tabBarExtraContent={
				<div className={styles.extraContentContainer}>
					<GoToButton
						onClick={() => {
							if (resource) {
								pause(
									resource.offsetStartTime ||
										resource.startTime,
								)

								message.success(
									`Changed player time to when ${getNetworkResourcesDisplayName(
										resource.initiatorType,
									)} request started at ${MillisToMinutesAndSeconds(
										resource.startTime,
									)}.`,
								)
							} else if (error) {
								const sessionTotalTime =
									sessionMetadata.totalTime
								const sessionStartTime =
									sessionMetadata.startTime

								const relativeTime =
									new Date(error.timestamp).getTime() -
									sessionStartTime

								if (
									sessionTotalTime !== undefined &&
									relativeTime >= 0 &&
									relativeTime <= sessionTotalTime
								) {
									pause(relativeTime)

									message.success(
										`Changed player time to when error occurred at ${MillisToMinutesAndSeconds(
											relativeTime,
										)}.`,
									)
								}
							}
						}}
					/>
				</div>
			}
			id={`${resource ? 'Network' : ''}${
				error ? 'Error' : ''
			}RightPanelTabs`}
		/>
	)
}

const getOptions = (content: any, id: string) => ({
	title: null,
	content,
	options: {
		noHeader: true,
		noPadding: true,
	},
	id,
})

export const useResourceOrErrorDetailPanel = () => {
	const { setDetailedPanel, detailedPanel } = usePlayerUIContext()

	const setResourceOrErrorPanel = useCallback(
		(resource?: NetworkResource, error?: ErrorObject) => {
			const content = (
				<ResourceOrErrorDetailPanelContent
					resource={resource}
					error={error}
				/>
			)

			setDetailedPanel(
				getOptions(content, (resource ?? error)?.id.toString() || ''),
			)
		},
		[setDetailedPanel],
	)

	const setResourcePanel = useCallback(
		(resource: NetworkResource) => {
			const content = (
				<ResourceOrErrorDetailPanelContent resource={resource} />
			)
			setDetailedPanel(getOptions(content, resource.id.toString()))
		},
		[setDetailedPanel],
	)

	return {
		setResourceOrErrorPanel,
		setResourcePanel,
		panelIsOpen: detailedPanel !== undefined,
	}
}
