import { Button } from '@components/Button'
import { Box, Callout, Stack, Text } from '@highlight-run/ui/components'
import { useNavigate } from 'react-router-dom'
import { useSessionStorage } from 'react-use'

import { useGetBillingDetailsQuery } from '@/graph/generated/hooks'
import { ProductType } from '@/graph/generated/schemas'
import { getMeterAmounts } from '@/pages/Billing/utils/utils'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'
import { formatNumberWithDelimiters } from '@/util/numbers'

export const LogsOverageCard = () => {
	const [hideOverageCard, setHideOverageCard] = useSessionStorage(
		`highlightHideOverageCard-${ProductType.Logs}`,
		false,
	)

	const navigate = useNavigate()
	const { currentWorkspace } = useApplicationContext()
	const { data, loading } = useGetBillingDetailsQuery({
		variables: { workspace_id: currentWorkspace?.id ?? '' },
		skip: !currentWorkspace,
	})

	if (loading || !data || hideOverageCard) {
		return null
	}

	if (data.subscription_details.billingIssue) {
		return (
			<BillingIssueCard
				blocked={data.subscription_details.billingIngestBlocked}
			/>
		)
	}

	const meters = getMeterAmounts({
		workspace: data.workspace,
		details: data.billingDetails,
	})
	const meter = meters[ProductType.Logs][0]
	const quota = meters[ProductType.Logs][1]
	if (quota === undefined || meter < quota) {
		return null
	}

	return (
		<Box py="4" px="12">
			<Callout icon={false}>
				<Stack
					direction="row"
					alignItems="center"
					justifyContent="space-between"
				>
					<Stack direction="column" gap="12" my="6">
						<Box alignItems="flex-start" display="flex">
							<Box>
								<Text
									color="strong"
									weight="bold"
									size="medium"
								>
									Logs overage!
								</Text>
							</Box>
						</Box>
						<Text color="moderate">
							You've reached your limit of{' '}
							<b>{formatNumberWithDelimiters(quota)}</b> logs this
							month. To record more logs, update your limit!
						</Text>
					</Stack>

					<Stack direction="row" gap="8">
						<Button
							kind="primary"
							onClick={() => {
								navigate(
									`/w/${currentWorkspace!.id}/current-plan`,
								)
							}}
							trackingId="overageUpdateLimit"
						>
							Update limit
						</Button>

						<Button
							kind="secondary"
							emphasis="low"
							onClick={() => {
								setHideOverageCard(true)
							}}
							trackingId="hideOverageCard"
						>
							Hide
						</Button>
					</Stack>
				</Stack>
			</Callout>
		</Box>
	)
}

const BillingIssueCard: React.FC<{ blocked?: boolean }> = ({ blocked }) => {
	const { currentWorkspace } = useApplicationContext()
	const navigate = useNavigate()
	return (
		<Box backgroundColor="n2" mb="4">
			<Callout icon={false}>
				<Stack
					direction="row"
					alignItems="center"
					justifyContent="space-between"
				>
					<Stack direction="column" gap="12" my="6">
						<Box alignItems="flex-start" display="flex">
							<Box>
								<Text
									color="strong"
									weight="bold"
									size="medium"
								>
									{blocked
										? 'Billing issues are blocking data ingest!'
										: 'Billing issues may block data ingest.'}
								</Text>
							</Box>
						</Box>
						{blocked ? (
							<Text color="moderate">
								We're having trouble charging your payment
								method. Data is not being recorded until the
								issue is fixed. Please update your payment
								method to ensure your subscription is valid.
							</Text>
						) : (
							<Text color="moderate">
								We're having trouble charging your payment
								method. If the issue is not resolved, we will
								stop ingesting your data. Please check that your
								payment details are correct.
							</Text>
						)}
					</Stack>

					<Stack direction="row" gap="8">
						<Button
							kind="primary"
							onClick={() => {
								navigate(
									`/w/${currentWorkspace!.id}/current-plan`,
								)
							}}
							trackingId="overageUpdateLimit"
						>
							Update payment method
						</Button>
					</Stack>
				</Stack>
			</Callout>
		</Box>
	)
}
