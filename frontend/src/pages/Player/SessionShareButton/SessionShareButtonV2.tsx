import { useAuthContext } from '@authentication/AuthContext'
import {
	useGetWorkspaceSettingsQuery,
	useUpdateSessionIsPublicMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { colors } from '@highlight-run/ui/colors'
import {
	Box,
	IconSolidGlobeAlt,
	IconSolidLink,
	IconSolidQuestionMarkCircle,
	Menu,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import {
	onGetLink,
	onGetLinkWithTimestamp,
} from '@pages/Player/SessionShareButton/utils/utils'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { copyToClipboard } from '@util/string'
import { MillisToMinutesAndSeconds } from '@util/time'
import { useState } from 'react'

import Switch from '../../../components/Switch/Switch'
import { useReplayerContext } from '../ReplayerContext'
import * as styles from './SessionShareButtonV2.css'

const SessionShareButtonV2 = () => {
	const [shareTimestamp, setShareTimestamp] = useState(false)
	const { time } = useReplayerContext()
	const { isLoggedIn } = useAuthContext()
	const { session } = useReplayerContext()
	const { session_secure_id } = useParams<{
		session_secure_id: string
	}>()
	const { currentWorkspace } = useApplicationContext()
	const { data } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: currentWorkspace?.id ?? '' },
		skip: !currentWorkspace?.id,
	})
	const canMakeSessionUnlisted =
		!!data?.workspaceSettings?.enable_unlisted_sharing
	const [updateSessionIsPublic] = useUpdateSessionIsPublicMutation({
		refetchQueries: [namedOperations.Query.GetSession],
	})

	return (
		<Menu placement="bottom">
			<Menu.Button
				size="small"
				kind="secondary"
				emphasis="low"
				onClick={() => {
					analytics.track('Clicked session share button')
				}}
			>
				Share
			</Menu.Button>
			<Menu.List cssClass={styles.noPadding}>
				{isLoggedIn && canMakeSessionUnlisted ? (
					<Box
						padding="8"
						borderBottom="secondary"
						gap="8"
						display="flex"
						alignItems="center"
					>
						<Box style={{ flexShrink: 0 }}>
							<IconSolidGlobeAlt size={16} color={colors.n9} />
						</Box>
						<Box>
							<Box
								style={{ height: 20 }}
								display="flex"
								alignItems="center"
							>
								<Text
									size="small"
									weight="medium"
									color="n11"
									userSelect="none"
								>
									Web
								</Text>
							</Box>
							<Box
								style={{ height: 12 }}
								display="flex"
								alignItems="center"
							>
								<Text
									size="xxSmall"
									weight="regular"
									color="n10"
									userSelect="none"
								>
									Allow anyone with the link to view session.
								</Text>
							</Box>
						</Box>

						<Box>
							<Switch
								loading={!session}
								checked={!!session?.is_public}
								onChange={async (checked: boolean) => {
									analytics.track(
										'Toggled session isPublic',
										{
											is_public: checked,
										},
									)
									await updateSessionIsPublic({
										variables: {
											session_secure_id:
												session_secure_id!,
											is_public: checked,
										},
									})
								}}
								trackingId="SessionSharingExternal"
								setMarginForAnimation
							/>
						</Box>
					</Box>
				) : null}
				<Box
					px="8"
					py="6"
					display="flex"
					alignItems="center"
					justifyContent="space-between"
				>
					<Box display="flex" alignItems="center">
						<Box display="flex" alignItems="center" gap="8">
							<Tag
								shape="basic"
								kind="secondary"
								size="medium"
								iconLeft={<IconSolidLink size={12} />}
								onClick={() => {
									copyToClipboard(
										shareTimestamp
											? onGetLinkWithTimestamp(
													time,
											  ).toString()
											: onGetLink().toString(),
										{
											onCopyText:
												'Copied session link to clipboard!',
										},
									)
								}}
							>
								Copy link
							</Tag>
							<Text
								size="xxSmall"
								weight="medium"
								color="n11"
								userSelect="none"
							>
								@ {MillisToMinutesAndSeconds(time)}
							</Text>
						</Box>
						<Switch
							loading={!session}
							checked={shareTimestamp}
							onChange={(checked: boolean) => {
								analytics.track(
									'Toggled session include timestamp',
									{
										timestamp: shareTimestamp,
									},
								)
								setShareTimestamp(checked)
							}}
							trackingId="SessionShareURLIncludeTimestamp"
							setMarginForAnimation
						/>
					</Box>
					<Tag
						shape="basic"
						kind="secondary"
						emphasis="low"
						size="medium"
						iconLeft={<IconSolidQuestionMarkCircle size={12} />}
						onClick={() => {
							window.open(
								'https://www.highlight.io/docs/general/product-features/session-replay/sessions-search-deep-linking',
								'_blank',
							)
						}}
					>
						Learn more
					</Tag>
				</Box>
			</Menu.List>
		</Menu>
	)
}

export default SessionShareButtonV2
