import { Box, Dialog, Text } from '@highlight-run/ui'
import { useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useSearchParams } from 'react-router-dom'

import { Avatar } from '@/components/Avatar/Avatar'
import { LinkButton } from '@/components/LinkButton'
import { useProjectId } from '@/hooks/useProjectId'
import { usePlayer } from '@/pages/Player/PlayerHook/PlayerHook'
import { PlayerSearchParameters } from '@/pages/Player/PlayerHook/utils'
import PlayerPage from '@/pages/Player/PlayerPage'
import {
	getDisplayName,
	getIdentifiedUserProfileImage,
} from '@/pages/Sessions/SessionsFeedV3/MinimalSessionCard/utils/utils'
import { useParams } from '@/util/react-router/useParams'

import * as styles from './PlayerPanel.css'

// TODO: Could also think about rendering under a route rather than permanently
// rendering on the page.
export const PlayerPanel: React.FC = () => {
	const [_, setSearchParams] = useSearchParams()
	const { inPanel, projectId, sessionSecureId } = useSessionParams()
	const { session } = usePlayer()
	const displayValue = getDisplayName(session)

	const dialogStore = Dialog.useStore({
		open: !!inPanel,
		setOpen(open: boolean) {
			if (!open) {
				setSearchParams((params) => {
					params.delete('panel')
					params.delete('session_secure_id')
					params.delete(PlayerSearchParameters.tsAbs)
					return params
				})
			}
		},
	})

	useEffect(() => {
		if (inPanel) {
			dialogStore.show()
		}
	}, [dialogStore, inPanel])

	useHotkeys('esc', () => {
		dialogStore.hide()
	})

	if (!inPanel) {
		return null
	}

	return (
		<Dialog
			store={dialogStore}
			modal={false}
			autoFocusOnShow={false}
			className={styles.dialog}
			backdrop={<Box style={{ background: 'rgba(0, 0, 0, 0.1)' }} />}
		>
			<Box
				p="8"
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				background="raised"
			>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					gap="8"
				>
					<Avatar
						seed={getDisplayName(session)}
						style={{ height: 20, width: 20 }}
						customImage={getIdentifiedUserProfileImage(session)}
					/>

					<Text weight="bold" lines="1">
						{displayValue}
					</Text>
				</Box>

				<LinkButton
					to={`/${projectId}/sessions/${sessionSecureId}`}
					trackingId="view-session_planer-panel"
					kind="secondary"
				>
					View session
				</LinkButton>
			</Box>
			<PlayerPage />
		</Dialog>
	)
}

interface PanelSearchParams extends URLSearchParams {
	[Symbol.iterator](): IterableIterator<
		['panel' | 'session_secure_id', string]
	>
}

type SetPanelSearchParams = (params: PanelSearchParams) => PanelSearchParams

export const usePanelParams = () => {
	const [searchParams, setSearchParams] = useSearchParams()

	return [
		searchParams as PanelSearchParams,
		setSearchParams as SetPanelSearchParams,
	]
}

export const useSessionParams = (): {
	inPanel: boolean
	projectId: string
	sessionSecureId?: string
} => {
	const { projectId } = useProjectId()
	const [searchParams] = useSearchParams()
	const { session_secure_id } = useParams<{ session_secure_id?: string }>()
	const inPanel = searchParams.get('panel') === 'session'

	return {
		inPanel,
		projectId,
		sessionSecureId:
			session_secure_id ??
			searchParams.get('session_secure_id') ??
			undefined,
	}
}
