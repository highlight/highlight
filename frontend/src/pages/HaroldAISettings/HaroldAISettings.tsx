import { toast } from '@components/Toaster'
import {
	Box,
	Heading,
	IconSolidExternalLink,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useAuthorization } from '@util/authorization/authorization'
import { POLICY_NAMES } from '@util/authorization/authorizationPolicies'

import BorderBox from '@/components/BorderBox/BorderBox'
import { Button } from '@/components/Button'
import { ToggleRow } from '@/components/ToggleRow/ToggleRow'
import {
	useEditWorkspaceSettingsMutation,
	useGetWorkspaceSettingsQuery,
} from '@/graph/generated/hooks'
import { namedOperations } from '@/graph/generated/operations'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'

type AiSetting = {
	label: string
	info: string
	key: 'ai_application' | 'ai_insights' | 'ai_query_builder'
	feature: string
}

const AI_FEATURES: AiSetting[] = [
	{
		label: 'Error Suggestions & Session Summarization',
		info: 'Enable error suggestions and session summarization across the app',
		key: 'ai_application',
		feature: 'Application',
	},
	{
		label: 'Session Insight Digest',
		info: 'Supercharge your session insight digests with AI',
		key: 'ai_insights',
		feature: 'Session Insights Digests',
	},
	{
		label: 'AI-powered Query Builder',
		info: 'Build queries with natural language using the power of Harold',
		key: 'ai_query_builder',
		feature: 'Query Builder',
	},
]

export const HaroldAISettings = () => {
	const { currentWorkspace } = useApplicationContext()

	const [editWorkspaceSettings] = useEditWorkspaceSettingsMutation({
		refetchQueries: [namedOperations.Query.GetWorkspaceSettings],
	})
	const { data, loading } = useGetWorkspaceSettingsQuery({
		variables: { workspace_id: String(currentWorkspace?.id) },
		skip: !currentWorkspace?.id,
	})

	const { checkPolicyAccess } = useAuthorization()
	const canEdit = checkPolicyAccess({
		policyName: POLICY_NAMES.HaroldSettingsUpdate,
	})

	const handleSwitch = (setting: AiSetting) => (isOptIn: boolean) => {
		if (!currentWorkspace?.id) {
			return
		}
		editWorkspaceSettings({
			variables: {
				...data?.workspaceSettings,
				workspace_id: currentWorkspace?.id,
				[setting.key]: isOptIn,
			},
		})
			.then(() => {
				toast.success(
					`${isOptIn ? 'Enabled' : 'Disabled'} Harold for your ${
						setting.feature
					}.`,
				)
			})
			.catch((reason: any) => {
				toast.error(String(reason))
			})
	}

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
							Harold Features
						</Text>
						{AI_FEATURES.map((c) => (
							<BorderBox key={c.key}>
								{ToggleRow(
									c.label,
									c.info,
									data?.workspaceSettings?.[c.key] ?? false,
									handleSwitch(c),
									loading || !canEdit,
									canEdit
										? ''
										: 'Please contact your admin to update',
								)}
							</BorderBox>
						))}
					</Stack>
				</Stack>
			</Box>
		</Box>
	)
}
