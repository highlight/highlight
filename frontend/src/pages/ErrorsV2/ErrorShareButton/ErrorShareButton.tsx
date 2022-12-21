import { useAuthContext } from '@authentication/AuthContext'
import Switch from '@components/Switch/Switch'
import { useUpdateErrorGroupIsPublicMutation } from '@graph/hooks'
import { GetErrorGroupQuery } from '@graph/operations'
import {
	Box,
	IconGlobeAlt,
	IconLink,
	IconQuestionMarkCircle,
	IconShare,
	Popover,
	Tag,
	Text,
} from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { copyToClipboard } from '@util/string'

interface Props {
	errorGroup: GetErrorGroupQuery['error_group']
}

const ErrorShareButton = ({ errorGroup }: Props) => {
	const { isLoggedIn } = useAuthContext()

	return (
		<Popover placement="bottom">
			<Popover.ButtonTrigger
				size="small"
				kind="secondary"
				emphasis="low"
				iconRight={<IconShare />}
			>
				Share
			</Popover.ButtonTrigger>
			<Popover.Content>
				<Box
					backgroundColor="white"
					borderRadius="6"
					border="secondary"
					overflow="scroll"
					boxShadow="small"
					overflowX="hidden"
					overflowY="hidden"
				>
					<Box
						padding="8"
						borderBottom="secondary"
						gap="8"
						display="flex"
						alignItems="center"
					>
						<IconGlobeAlt size={16} color={colors.n9} />
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
									Allow anyone with the link to view this
									error.
								</Text>
							</Box>
						</Box>
						{isLoggedIn && (
							<ExternalSharingToggle errorGroup={errorGroup} />
						)}
					</Box>
					<Box
						px="8"
						py="6"
						display="flex"
						justifyContent="space-between"
					>
						<Tag
							shape="basic"
							kind="grey"
							size="medium"
							iconLeft={<IconLink size={12} />}
							onClick={() => {
								copyToClipboard(window.location.href, {
									onCopyText:
										'Copied error link to clipboard!',
								})
							}}
						>
							Copy link
						</Tag>
						<Tag
							shape="basic"
							kind="transparent"
							size="medium"
							iconLeft={<IconQuestionMarkCircle size={12} />}
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
				</Box>
			</Popover.Content>
		</Popover>
	)
}

const ExternalSharingToggle = ({ errorGroup }: Props) => {
	const [updateErrorGroupIsPublic, { loading }] =
		useUpdateErrorGroupIsPublicMutation({
			update(cache, { data }) {
				const isPublic =
					data?.updateErrorGroupIsPublic?.is_public === true

				cache.modify({
					fields: {
						errorGroup(existingErrorGroup) {
							const updatedErrorGroup = {
								...existingErrorGroup,
								isPublic,
							}
							return updatedErrorGroup
						},
					},
				})
			},
		})

	return (
		<Switch
			loading={loading}
			checked={errorGroup?.is_public === true}
			onChange={(checked: boolean) => {
				updateErrorGroupIsPublic({
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
