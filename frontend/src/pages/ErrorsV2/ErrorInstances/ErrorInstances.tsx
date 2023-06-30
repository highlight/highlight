import { Box, Callout, Card, Stack, Text } from '@highlight-run/ui'
import React from 'react'

import { Button } from '@/components/Button'
import LoadingBox from '@/components/LoadingBox'
import { useGetErrorObjectsQuery } from '@/graph/generated/hooks'
import { GetErrorGroupQuery } from '@/graph/generated/operations'
import { ErrorObjectEdge } from '@/graph/generated/schemas'
import { ErrorInstancesTable } from '@/pages/ErrorsV2/ErrorInstances/ErrorInstancesTable'
import { NoErrorInstancesFound } from '@/pages/ErrorsV2/ErrorInstances/NoErrorInstancesFound'

type Props = {
	errorGroup: GetErrorGroupQuery['error_group']
}

export const ErrorInstances = ({ errorGroup }: Props) => {
	const { data, loading, error } = useGetErrorObjectsQuery({
		variables: {
			errorGroupSecureID: errorGroup?.secure_id ?? '',
		},
		skip: !errorGroup?.secure_id,
	})

	if (loading) {
		return (
			<ErrorInstancesContainer
				canMoveBackward={false}
				canMoveForward={false}
			>
				<Card>
					<LoadingBox height={156} />
				</Card>
			</ErrorInstancesContainer>
		)
	}
	if (error)
		return (
			<ErrorInstancesContainer
				canMoveBackward={false}
				canMoveForward={false}
			>
				<Box m="auto" style={{ maxWidth: 300 }}>
					<Callout
						title="Failed to load error instances"
						kind="error"
					>
						<Box mb="6">
							<Text color="moderate">
								There was an error loading error instances.
								Reach out to us if this might be a bug.
							</Text>
						</Box>
					</Callout>
				</Box>
			</ErrorInstancesContainer>
		)

	const edges: ErrorObjectEdge[] =
		data?.error_objects?.edges.map((edge) => edge) || []

	if (edges.length === 0) {
		return (
			<ErrorInstancesContainer
				canMoveBackward={false}
				canMoveForward={false}
			>
				<NoErrorInstancesFound />
			</ErrorInstancesContainer>
		)
	}

	const pageInfo = data?.error_objects.pageInfo

	return (
		<ErrorInstancesContainer
			canMoveBackward={pageInfo?.hasPreviousPage ?? false}
			canMoveForward={pageInfo?.hasNextPage ?? false}
			onBackward={() => {}}
			onForward={() => {}}
		>
			<ErrorInstancesTable edges={edges} />
		</ErrorInstancesContainer>
	)
}

type ErrorInstancesContainerProps = {
	canMoveBackward: boolean
	canMoveForward: boolean
	onBackward?: () => void
	onForward?: () => void
}

const ErrorInstancesContainer: React.FC<
	React.PropsWithChildren<ErrorInstancesContainerProps>
> = ({ canMoveBackward, canMoveForward, onBackward, onForward, children }) => {
	return (
		<>
			<Box my="20" borderBottom="secondary">
				{children}
			</Box>
			<Stack direction="row" justifyContent="flex-end">
				<Button
					kind="secondary"
					trackingId="errorInstancesPreviousButton"
					disabled={!canMoveBackward}
					onClick={onBackward}
				>
					Previous
				</Button>
				<Button
					kind="secondary"
					trackingId="errorInstancesNextButton"
					disabled={!canMoveForward}
					onClick={onForward}
				>
					Next
				</Button>
			</Stack>
		</>
	)
}
