import { Button } from '@components/Button'
import { Box, Callout, Stack, Text } from '@highlight-run/ui'
import { useNavigate } from 'react-router-dom'
import { useSessionStorage } from 'react-use'

import { useGetBillingDetailsForProjectQuery } from '@/graph/generated/hooks'
import { ProductType } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { getMeterAmounts } from '@/pages/Billing/utils/utils'
import { useApplicationContext } from '@/routers/ProjectRouter/context/ApplicationContext'
import { formatNumberWithDelimiters } from '@/util/numbers'

interface Props {
	productType: ProductType
}

export const OverageCard = ({ productType }: Props) => {
	const [hideOverageCard, setHideOverageCard] = useSessionStorage(
		`highlightHideOverageCard-${productType}`,
		false,
	)

	const navigate = useNavigate()
	const { currentWorkspace } = useApplicationContext()
	const { projectId } = useProjectId()
	const { data, loading } = useGetBillingDetailsForProjectQuery({
		variables: { project_id: projectId },
	})

	if (loading || !data || hideOverageCard) {
		return null
	}

	const meters = getMeterAmounts(data)
	const meter = meters[productType][0]
	const quota = meters[productType][1]
	if (quota === undefined || meter < quota) {
		return null
	}

	const productTypeLower = productType.toLowerCase()

	return (
		<Box backgroundColor="n2" mb="4">
			<Callout title={`${productType} overage!`} icon={false}>
				<Text color="moderate">
					You've reached your limit of{' '}
					<b>{formatNumberWithDelimiters(quota)}</b>{' '}
					{productTypeLower} this month. To record more{' '}
					{productTypeLower}, update your limit!
				</Text>

				<Stack direction="row" gap="8">
					<Button
						kind="primary"
						onClick={() => {
							navigate(`/w/${currentWorkspace!.id}/current-plan`)
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
			</Callout>
		</Box>
	)
}
