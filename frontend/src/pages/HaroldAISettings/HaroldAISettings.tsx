import { toast } from '@components/Toaster'
import { Box, Heading, Stack, Text } from '@highlight-run/ui/components'
import { useAuthorization } from '@util/authorization/authorization'
import { POLICY_NAMES } from '@util/authorization/authorizationPolicies'

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
		<Box border="secondary" borderRadius="6" p="16">
			<Stack gap="24">
				<Stack direction="column" gap="8">
					<Heading level="h3">Harold AI</Heading>
					<Text color="moderate">
						Highlight&apos;s Harold is an AI assistant helping you better
						understand the context around your data. Harold is based on OpenAI
						GPT-3.5.
					</Text>
				</Stack>

				<Box border="secondary" borderRadius="6" p="16">
					<Stack direction="column" gap="12">
						<Stack direction="column" gap="4">
							<Heading level="h4">Learn more about Highlight&apos;s AI</Heading>
							<Text color="moderate">
								Curious about how we use OpenAI&apos;s GPT-3.5 to power our AI
								services? Read the blog post!
							</Text>
						</Stack>

						<Box>
							<Button
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
					</Stack>
				</Box>

				<Stack direction="column" gap="12">
					<Heading level="h4">Harold Features</Heading>

					<Stack direction="column" gap="8">
						{AI_FEATURES.map((setting) => (
							<Box
								key={setting.key}
								border="secondary"
								borderRadius="6"
								p="12"
							>
								{ToggleRow(
									setting.label,
									setting.info,
									data?.workspaceSettings?.[setting.key] ?? false,
									handleSwitch(setting),
									loading || !canEdit,
									canEdit ? '' : 'Please contact your admin to update',
								)}
							</Box>
						))}
					</Stack>
				</Stack>
			</Stack>
		</Box>
	)
}
