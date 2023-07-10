import { Box, Callout, Stack, Text } from '@highlight-run/ui'
import React, { useState } from 'react'

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

type Pagination = {
	after: string | null
	before: string | null
}

export const ErrorInstances = ({ errorGroup }: Props) => {
	const [pagination, setPagination] = useState<Pagination>({
		after: null,
		before: null,
	})
	const { data, loading, error } = useGetErrorObjectsQuery({
		variables: {
			errorGroupSecureID: errorGroup?.secure_id ?? '',
			after: pagination.after,
			before: pagination.before,
			query: '', // unused, will be used to search by email (https://github.com/highlight/highlight/issues/5850)
		},
		skip: !errorGroup?.secure_id,
	})

	if (loading) {
		return (
			<ErrorInstancesContainer
				canMoveBackward={false}
				canMoveForward={false}
			>
				<LoadingBox height={156} />
			</ErrorInstancesContainer>
		)
	}
	if (error || !data)
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
							</Text>
						</Box>
					</Callout>
				</Box>
			</ErrorInstancesContainer>
		)

	const handlePreviousPage = () => {
		setPagination({
			after: null,
			before: data.error_objects.pageInfo.startCursor,
		})
	}

	const handleNextPage = () => {
		setPagination({
			after: data.error_objects.pageInfo.endCursor,
			before: null,
		})
	}

	const edges: ErrorObjectEdge[] =
		data.error_objects?.edges.map((edge) => edge) || []

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
			onPrevious={handlePreviousPage}
			onNext={handleNextPage}
		>
			<ErrorInstancesTable edges={edges} />
		</ErrorInstancesContainer>
	)
}

type ErrorInstancesContainerProps = {
	canMoveBackward: boolean
	canMoveForward: boolean
	onPrevious?: () => void
	onNext?: () => void
}

const ErrorInstancesContainer: React.FC<
	React.PropsWithChildren<ErrorInstancesContainerProps>
> = ({ canMoveBackward, canMoveForward, onPrevious, onNext, children }) => {
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
					onClick={onPrevious}
				>
					Previous
				</Button>
				<Button
					kind="secondary"
					trackingId="errorInstancesNextButton"
					disabled={!canMoveForward}
					onClick={onNext}
				>
					Next
				</Button>
			</Stack>
		</>
	)
}
