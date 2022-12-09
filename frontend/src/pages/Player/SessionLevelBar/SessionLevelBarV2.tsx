import { useAuthContext } from '@authentication/AuthContext'
import { DEFAULT_PAGE_SIZE } from '@components/Pagination/Pagination'
import { useGetSessionsOpenSearchQuery } from '@graph/hooks'
import {
	Box,
	ButtonIcon,
	IconCaretDown,
	IconDocumentDuplicate,
	IconExitRight,
	IconLockClosed,
	IconLockOpened,
	IconTemplate,
	Text,
	TextLink,
} from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { changeSession } from '@pages/Player/PlayerHook/utils'
import usePlayerConfiguration from '@pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { defaultSessionsQuery } from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/QueryBuilder'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React, { useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'

import SessionShareButtonV2 from '../SessionShareButton/SessionShareButtonV2'
import * as styles from './style.css'

export const SessionLevelBarV2: React.FC<
	React.PropsWithChildren & {
		width: number
	}
> = (props) => {
	const history = useHistory()
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { viewport, currentUrl, session, sessionResults, setSessionResults } =
		useReplayerContext()
	const { page } = useSearchContext()
	const { isLoggedIn } = useAuthContext()
	const { showLeftPanel, setShowLeftPanel } = usePlayerConfiguration()
	const query = useMemo(() => JSON.stringify(defaultSessionsQuery), [])
	const { data } = useGetSessionsOpenSearchQuery({
		variables: {
			query,
			count: DEFAULT_PAGE_SIZE,
			page: page && page > 0 ? page : 1,
			project_id,
			sort_desc: true,
		},
		fetchPolicy: 'cache-first',
	})

	let currentSession = sessionResults.sessions.findIndex(
		(s) => s.secure_id === session?.secure_id,
	)
	if (currentSession === -1) {
		currentSession = -1
	}
	const [prev, next] = [currentSession - 1, currentSession + 1]

	useEffect(() => {
		if (
			!sessionResults.sessions.length &&
			data?.sessions_opensearch.sessions.length
		) {
			setSessionResults({
				...data.sessions_opensearch,
				sessions: data.sessions_opensearch.sessions.map((s) => ({
					...s,
					payload_updated_at: new Date().toISOString(),
				})),
			})
		}
	}, [
		data?.sessions_opensearch,
		sessionResults.sessions.length,
		setSessionResults,
	])

	return (
		<div
			className={styles.sessionLevelBarV2}
			style={{ width: props.width }}
		>
			<Box
				px={'12'}
				py={'6'}
				gap={'12'}
				display={'flex'}
				width={'full'}
				justifyContent={'space-between'}
				align={'center'}
			>
				<Box className={styles.leftButtons}>
					{isLoggedIn && !showLeftPanel && (
						<ButtonIcon
							kind="secondary"
							size="medium"
							shape="square"
							emphasis="medium"
							icon={<IconExitRight size={14} />}
							onClick={() => setShowLeftPanel(true)}
							className={styles.openLeftPanelButton}
						/>
					)}
					<Box
						display={'flex'}
						align={'center'}
						px={'7'}
						onClick={() => {
							changeSession(
								project_id,
								history,
								sessionResults.sessions[prev],
								'',
							)
						}}
					>
						<IconCaretDown className={styles.invertedCaret} />
					</Box>
					<div className={styles.verticalBar} />
					<Box
						display={'flex'}
						align={'center'}
						px={'7'}
						onClick={() => {
							changeSession(
								project_id,
								history,
								sessionResults.sessions[next],
								'',
							)
						}}
					>
						<IconCaretDown className={styles.caret} />
					</Box>
					<Box className={styles.currentUrl}>
						<TextLink
							href={currentUrl || ''}
							underline={'none'}
							color={'none'}
						>
							{currentUrl}
						</TextLink>
					</Box>
					{currentUrl && (
						<Box
							paddingLeft={'8'}
							display={'flex'}
							align={'center'}
							onClick={() => {
								if (currentUrl?.length) {
									navigator.clipboard.writeText(currentUrl)
									message.success('Copied url to clipboard')
								}
							}}
						>
							<IconDocumentDuplicate color={colors.neutralN9} />
						</Box>
					)}
				</Box>
				{session && (
					<Box className={styles.rightButtons}>
						<Box display={'flex'} align={'center'} gap={'2'}>
							<IconTemplate color={colors.neutralN9} />
							<Text
								size="medium"
								color="neutralN11"
								userSelect="none"
							>
								{viewport?.width} x {viewport?.height}
							</Text>
						</Box>
						<Box display={'flex'} align={'center'} gap={'2'}>
							{session?.enable_strict_privacy ? (
								<IconLockClosed color={colors.neutralN9} />
							) : (
								<IconLockOpened color={colors.neutralN9} />
							)}
							<Text
								size="medium"
								color="neutralN11"
								userSelect="none"
							>
								Privacy{' '}
								{session?.enable_strict_privacy ? 'on' : 'off'}
							</Text>
						</Box>
						<Box display={'flex'} align={'center'} gap={'6'}>
							<SessionShareButtonV2 />
						</Box>
					</Box>
				)}
			</Box>
		</div>
	)
}

export default SessionLevelBarV2
