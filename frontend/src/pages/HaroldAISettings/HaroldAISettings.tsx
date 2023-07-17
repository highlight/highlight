import {
	Box,
	Heading,
	IconSolidExternalLink,
	Stack,
	Text,
} from '@highlight-run/ui'
import { message } from 'antd'

import BorderBox from '@/components/BorderBox/BorderBox'
import { Button } from '@/components/Button'
import { ToggleRow } from '@/components/ToggleRow/ToggleRow'
import {
	useEditWorkspaceSettingsMutation,
	useGetWorkspaceSettingsQuery,
} from '@/graph/generated/hooks'
import { namedOperations } from '@/graph/generated/operations'
import { useParams } from '@/util/react-router/useParams'

export const HaroldAISettings = () => {
	const { workspace_id } = useParams<{ workspace_id: string }>()

	const [editWorkspaceSettings] = useEditWorkspaceSettingsMutation({
		refetchQueries: [namedOperations.Query.GetWorkspaceSettings],
	})
	const { data, loading } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: workspace_id! },
		skip: !workspace_id,
	})

	const features = [
		{
			label: 'Session Insight Digest',
			info: 'Supercharge your session insight digests with AI',
		},
	]

	return (
		<Box>
			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<Stack gap="24" direction="column">
					<Stack gap="16" direction="column">
						<Heading mt="16" level="h4">
							Harold AI
						</Heading>
						<Text weight="medium" size="small" color="default">
							Highlight's Harold is an AI assistant helping you
							better understand the context around your data.
							Harold is based on OpenAI GPT-3.5.
						</Text>
					</Stack>
					<BorderBox>
						<Box pt="4">
							<Stack gap="12" direction="column" pb="12">
								<Text weight="bold" size="small" color="strong">
									Learn more about Highlight's AI
								</Text>
								<Text color="moderate">
									Curious about how we use OpenAI's GPT-3.5 to
									power our AI services? Read the blog post!
								</Text>
							</Stack>
							<Button
								kind="secondary"
								emphasis="high"
								iconRight={<IconSolidExternalLink size={14} />}
								onClick={() => {
									window.open(
										'https://highlight.io/blog/introducing-harold',
										'_blank',
									)
								}}
								trackingId="settings_ai-learn-more"
							>
								Read the blog post
							</Button>
						</Box>
					</BorderBox>
					<Stack gap="12" direction="column" paddingTop="24">
						<Text weight="bold" size="small" color="default">
							Features
						</Text>
						{features.map((c) => (
							<BorderBox key={c.label}>
								{ToggleRow(
									c.label,
									c.info,
									data?.workspaceSettings?.ai_insights ??
										false,
									(isOptIn: boolean) => {
										if (!workspace_id) {
											return
										}
										editWorkspaceSettings({
											variables: {
												workspace_id: workspace_id,
												ai_insights: isOptIn,
											},
										})
											.then(() => {
												message.success(
													`${
														isOptIn
															? 'Enabled'
															: 'Disabled'
													} Harold AI for Session Insights Digests.`,
												)
											})
											.catch((reason: any) => {
												message.error(String(reason))
											})
									},
									loading,
								)}
							</BorderBox>
						))}
					</Stack>
				</Stack>
			</Box>
		</Box>
	)
}
