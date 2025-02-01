import { useEffect, useState } from 'react'
import {
	Badge,
	Box,
	ButtonIcon,
	Heading,
	IconSolidArrowRight,
	IconSolidBookOpen,
	IconSolidClipboard,
	IconSolidDiscord,
	IconSolidExternalLink,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { quickStartContentReorganized } from 'highlight.io'

import { Button } from '@/components/Button'
import LoadingBox from '@components/LoadingBox'
import { toast } from '@components/Toaster'
import {
	useGetProjectQuery,
	useEditProjectPlatformsMutation,
} from '@graph/hooks'
import { useProjectId } from '@hooks/useProjectId'
import analytics from '@util/analytics'
import { PlatformSelection } from '@/pages/Connect/PlatformSelection'
import { useNavigate } from 'react-router-dom'

const ICON_FILL = vars.theme.interactive.fill.secondary.content.text

export const NewConnectPage = () => {
	const { projectId } = useProjectId()
	const navigate = useNavigate()

	const { data } = useGetProjectQuery({
		variables: { id: projectId! },
		fetchPolicy: 'no-cache',
	})
	const projectVerboseId = data?.project?.verbose_id

	const [editProjectPlatforms, { loading }] =
		useEditProjectPlatformsMutation()

	const [selectedPlatforms, setSelectedPlatforms] = useState(
		new Set<string>(),
	)

	useEffect(() => {
		if (data?.project?.platforms) {
			setSelectedPlatforms(new Set(data.project.platforms))
		}
	}, [data])

	const handleSave = () => {
		editProjectPlatforms({
			variables: {
				projectId: projectId!,
				platforms: Array.from(selectedPlatforms),
			},
		})
			.then(() => {
				toast.success('Platforms updated.')
				navigate(`/${projectId}/connect`)
			})
			.catch(() => {
				toast.error('Failed to update platforms.')
			})
	}

	useEffect(() => analytics.page('New Connect'), [])

	if (!projectVerboseId) {
		return <LoadingBox />
	}

	const copyProjectId = () => {
		window.navigator.clipboard.writeText(projectVerboseId!)
		toast.success('Project ID copied to your clipboard!')
	}

	return (
		<Box
			background="n2"
			padding="8"
			flex="stretch"
			justifyContent="stretch"
			display="flex"
		>
			<Box
				background="white"
				borderRadius="6"
				flexDirection="column"
				display="flex"
				flexGrow={1}
				p="40"
				border="dividerWeak"
				overflowY="auto"
				shadow="medium"
			>
				<Stack mx="auto" style={{ maxWidth: 960 }} width="full">
					<Heading level="h2" mb="40">
						Select your platforms
					</Heading>
					<Stack direction="row" gap="32">
						<Stack gap="12" flexGrow={0} style={{ maxWidth: 350 }}>
							<Stack
								direction="row"
								border="dividerWeak"
								borderRadius="6"
								justifyContent="space-between"
								px="4"
								background="raised"
							>
								<Stack direction="row" gap="6" align="center">
									<Text color="moderate" size="xSmall">
										Project ID:
									</Text>
									<Tag
										kind="secondary"
										emphasis="low"
										shape="basic"
										onClick={copyProjectId}
									>
										{projectVerboseId}
									</Tag>
								</Stack>
								<ButtonIcon
									kind="secondary"
									emphasis="low"
									icon={<IconSolidClipboard />}
									onClick={copyProjectId}
								/>
							</Stack>
							<Text color="moderate">
								Don't see your platform? Let us know in the
								Discord channel.
							</Text>
							<Box display="flex" gap="8">
								<a
									href="https://discord.gg/yxaXEAqgwN"
									target="_blank"
									rel="noreferrer"
									style={{ display: 'flex' }}
								>
									<Badge
										variant="outlineGray"
										label="Highlight.io"
										size="medium"
										iconStart={
											<IconSolidDiscord
												fill={ICON_FILL}
											/>
										}
										iconEnd={
											<IconSolidExternalLink
												fill={ICON_FILL}
											/>
										}
									/>
								</a>
								<a
									href="https://www.highlight.io/docs/getting-started/overview"
									target="_blank"
									rel="noreferrer"
									style={{ display: 'flex' }}
								>
									<Badge
										variant="outlineGray"
										label="Full Documentation"
										size="medium"
										iconStart={
											<IconSolidBookOpen
												fill={ICON_FILL}
											/>
										}
										iconEnd={
											<IconSolidExternalLink
												fill={ICON_FILL}
											/>
										}
									>
										Highlight.io
									</Badge>
								</a>
							</Box>
							<Box as="span" borderBottom="divider" />

							<Stack pt="2" gap="8">
								<Text color="moderate">Current Selection</Text>
								<SelectedPlatformIcons
									platforms={selectedPlatforms}
								/>
							</Stack>
						</Stack>
						<Stack flexGrow={1} style={{ maxWidth: 610 }}>
							<Stack border="secondary" borderRadius="8">
								<PlatformSelection
									selectedPlatforms={selectedPlatforms}
									setSelectedPlatforms={setSelectedPlatforms}
								/>
							</Stack>
							<Box>
								<Button
									trackingId="setup-save-selected-platforms"
									onClick={handleSave}
									disabled={
										loading || selectedPlatforms.size === 0
									}
									kind="primary"
									iconRight={
										<IconSolidArrowRight color="white" />
									}
								>
									Integrate selected platforms
								</Button>
							</Box>
						</Stack>
					</Stack>
				</Stack>
			</Box>
		</Box>
	)
}

const SelectedPlatformIcons = ({ platforms }: { platforms: Set<string> }) => {
	if (platforms.size <= 0) {
		return <Text color="moderate">None</Text>
	}

	return (
		<Stack direction="row" gap="8" flexWrap="wrap">
			{Array.from(platforms).map((identifier) => {
				const [language, platform] = identifier.split('_')
				const sdk = (quickStartContentReorganized as any)[language]
					.sdks[platform]

				return (
					<Box
						key={identifier}
						alignItems="center"
						display="flex"
						justifyContent="center"
						style={{ height: 46, width: 46 }}
						borderRadius="5"
						border="secondary"
						borderWidth="medium"
					>
						{sdk?.logoUrl ? (
							<img
								alt={sdk.title}
								src={sdk.logoUrl}
								style={{
									height: 30,
									width: 30,
									borderRadius: 5,
								}}
							/>
						) : (
							<Text userSelect="none" weight="bold">
								{sdk.title[0].toUpperCase()}
							</Text>
						)}
					</Box>
				)
			})}
		</Stack>
	)
}
