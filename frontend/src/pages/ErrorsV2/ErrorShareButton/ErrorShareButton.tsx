import { useAuthContext } from '@authentication/AuthContext'
import Switch from '@components/Switch/Switch'
import {
	useGetWorkspaceSettingsQuery,
	useUpdateErrorGroupIsPublicMutation,
} from '@graph/hooks'
import { GetErrorGroupQuery, namedOperations } from '@graph/operations'
import {
	Box,
	IconSolidGlobeAlt,
	IconSolidLink,
	IconSolidQuestionMarkCircle,
	Menu,
	Tag,
	Text,
} from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { copyToClipboard } from '@util/string'

import * as style from './style.css'

interface Props {
	errorGroup: GetErrorGroupQuery['error_group']
}

const ErrorShareButton = ({ errorGroup }: Props) => {
	const { isLoggedIn } = useAuthContext()
	const { currentWorkspace } = useApplicationContext()
	const { data } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: currentWorkspace?.id ?? '' },
		skip: !currentWorkspace?.id,
	})
	const canMakeErrorUnlisted =
		!!data?.workspaceSettings?.enable_unlisted_sharing

	return (
		<Menu placement="bottom">
			<Menu.Button size="small" kind="secondary" emphasis="low">
				Share
			</Menu.Button>
			<Menu.List cssClass={style.noPadding}>
				{isLoggedIn && canMakeErrorUnlisted ? (
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
									Allow anyone with the link to view error.
								</Text>
							</Box>
						</Box>
						<ExternalSharingToggle errorGroup={errorGroup} />
					</Box>
				) : null}
				<Box
					px="8"
					py="6"
					display="flex"
					justifyContent="space-between"
				>
					<Tag
						shape="basic"
						kind="secondary"
						size="medium"
						iconLeft={<IconSolidLink size={12} />}
						onClick={() => {
							copyToClipboard(window.location.href, {
								onCopyText: 'Copied error link to clipboard!',
							})
						}}
					>
						Copy link
					</Tag>
					<Tag
						shape="basic"
						kind="secondary"
						emphasis="low"
						size="medium"
						iconLeft={<IconSolidQuestionMarkCircle size={12} />}
						onClick={() => {
							window.open(
								'https://highlight.io/docs/error-monitoring/error-sharing',
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

const ExternalSharingToggle = ({ errorGroup }: Props) => {
	const [updateErrorGroupIsPublic, { loading }] =
		useUpdateErrorGroupIsPublicMutation({
			refetchQueries: [namedOperations.Query.GetErrorGroup],
		})

	return (
		<Switch
			loading={loading}
			checked={errorGroup?.is_public === true}
			onChange={async (checked: boolean) => {
				await updateErrorGroupIsPublic({
					variables: {
						error_group_secure_id: errorGroup?.secure_id || '',
						is_public: checked,
					},
				})
			}}
			trackingId="ErrorSharingExternal"
		/>
	)
}

export default ErrorShareButton
