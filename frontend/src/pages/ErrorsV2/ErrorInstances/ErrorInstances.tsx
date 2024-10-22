import { Box, Callout, Stack, Text } from '@highlight-run/ui/components'
import React, { useState } from 'react'

import LoadingBox from '@/components/LoadingBox'
import {
	SearchContext,
	useSearchContext,
} from '@/components/Search/SearchContext'
import { SearchForm } from '@/components/Search/SearchForm/SearchForm'
import SearchPagination, {
	START_PAGE,
} from '@/components/SearchPagination/SearchPagination'
import { useGetErrorGroupInstancesQuery } from '@/graph/generated/hooks'
import { GetErrorGroupQuery } from '@/graph/generated/operations'
import { ProductType } from '@/graph/generated/schemas'
import { ErrorInstancesTable } from '@/pages/ErrorsV2/ErrorInstances/ErrorInstancesTable'
import { NoErrorInstancesFound } from '@/pages/ErrorsV2/ErrorInstances/NoErrorInstancesFound'

type Props = {
	errorGroup: GetErrorGroupQuery['error_group']
}

export interface SearchFormState {
	email: string
	hasSession: boolean
}

const PAGE_SIZE = 10

export const ErrorInstances = ({ errorGroup }: Props) => {
	const { startDate, endDate, query } = useSearchContext()
	const [submittedQuery, setSubmittedQuery] = useState(query)
	const [page, setPage] = useState(START_PAGE)

	const { data, loading, error } = useGetErrorGroupInstancesQuery({
		variables: {
			errorGroupSecureID: errorGroup?.secure_id ?? '',
			count: PAGE_SIZE,
			page: page,
			params: {
				query: submittedQuery,
				date_range: {
					start_date: startDate!.toISOString(),
					end_date: endDate!.toISOString(),
				},
			},
		},
		skip: !errorGroup?.secure_id,
	})

	const handleSubmit = (query: string) => {
		setSubmittedQuery(query)
		setPage(START_PAGE)
	}

	if (loading) {
		return (
			<ErrorInstancesContainer
				onSubmit={handleSubmit}
				query={submittedQuery}
			>
				<LoadingBox m="auto" />
			</ErrorInstancesContainer>
		)
	}
	if (error || !data)
		return (
			<ErrorInstancesContainer
				onSubmit={handleSubmit}
				query={submittedQuery}
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

	const { error_objects = [], totalCount = 0 } = data.error_objects

	if (error_objects.length === 0) {
		return (
			<ErrorInstancesContainer
				onSubmit={handleSubmit}
				query={submittedQuery}
			>
				<NoErrorInstancesFound />
			</ErrorInstancesContainer>
		)
	}

	return (
		<ErrorInstancesContainer onSubmit={handleSubmit} query={submittedQuery}>
			<ErrorInstancesTable
				nodes={error_objects}
				errorGroupSecureId={errorGroup?.secure_id}
			/>
			<SearchPagination
				page={page}
				setPage={setPage}
				totalCount={totalCount}
			/>
		</ErrorInstancesContainer>
	)
}

type ErrorInstancesContainerProps = {
	onSubmit: (query: string) => void
	query: string
}

const ErrorInstancesContainer: React.FC<
	React.PropsWithChildren<ErrorInstancesContainerProps>
> = ({ onSubmit, children, query }) => {
	const { startDate, endDate } = useSearchContext()

	return (
		<SearchContext initialQuery={query} onSubmit={onSubmit}>
			<Stack
				direction="column"
				borderRadius="6"
				border="dividerWeak"
				mt="16"
				gap="0"
			>
				<SearchForm
					startDate={startDate!}
					endDate={endDate!}
					onDatesChange={() => null}
					presets={[]}
					minDate={startDate!}
					timeMode="permalink"
					hideDatePicker
					hideCreateAlert
					productType={ProductType.Errors}
				/>
				<Stack
					alignItems="center"
					direction="column"
					justifyContent="space-between"
					style={{
						minHeight: '401px',
					}}
					width="full"
					gap="0"
				>
					{children}
				</Stack>
			</Stack>
		</SearchContext>
	)
}
