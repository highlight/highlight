import {
	Box,
	BoxProps,
	Callout,
	Form,
	FormState,
	IconSolidCheckCircle,
	IconSolidSearch,
	Stack,
	SwitchButton,
	Text,
	useFormStore,
} from '@highlight-run/ui'
import useLocalStorage from '@rehooks/local-storage'
import React, { useState } from 'react'

import { Button } from '@/components/Button'
import LoadingBox from '@/components/LoadingBox'
import { useGetErrorObjectsQuery } from '@/graph/generated/hooks'
import { GetErrorGroupQuery } from '@/graph/generated/operations'
import { ErrorObjectEdge } from '@/graph/generated/schemas'
import { ErrorInstancesTable } from '@/pages/ErrorsV2/ErrorInstances/ErrorInstancesTable'
import { NoErrorInstancesFound } from '@/pages/ErrorsV2/ErrorInstances/NoErrorInstancesFound'

import * as styles from './ErrorInstances.css'

type Props = {
	errorGroup: GetErrorGroupQuery['error_group']
}

type Pagination = {
	after: string | null
	before: string | null
}

export interface SearchFormState {
	email: string
	hasSession: boolean
}

export const ErrorInstances = ({ errorGroup }: Props) => {
	const [hasSessionDefault, setHasSessionDefault] = useLocalStorage<boolean>(
		'highlight-error-object-instances-has-session',
		false,
	)
	const [currentSearchEmail, setCurrentSearchEmail] = React.useState('')
	const formStore = useFormStore<SearchFormState>({
		defaultValues: {
			email: '',
			hasSession: hasSessionDefault,
		},
	})
	const email = formStore.useValue('email')
	const hasSession = formStore.useValue('hasSession')
	const [query, setQuery] = useState('')

	const [pagination, setPagination] = useState<Pagination>({
		after: null,
		before: null,
	})
	const { data, loading, error } = useGetErrorObjectsQuery({
		variables: {
			errorGroupSecureID: errorGroup?.secure_id ?? '',
			after: pagination.after,
			before: pagination.before,
			query,
		},
		skip: !errorGroup?.secure_id,
	})

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setQuery(`${hasSession ? 'has_session:true ' : ''}email:${email}`)
		setCurrentSearchEmail(email)
	}

	React.useEffect(() => {
		setHasSessionDefault(hasSession)
	}, [hasSession, setHasSessionDefault])

	if (loading) {
		return (
			<ErrorInstancesContainer
				canMoveBackward={false}
				canMoveForward={false}
				form={formStore}
				onSubmit={handleSubmit}
				verticallyAlign
			>
				<LoadingBox />
			</ErrorInstancesContainer>
		)
	}
	if (error || !data)
		return (
			<ErrorInstancesContainer
				canMoveBackward={false}
				canMoveForward={false}
				form={formStore}
				onSubmit={handleSubmit}
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
				form={formStore}
				onSubmit={handleSubmit}
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
			form={formStore}
			onSubmit={handleSubmit}
		>
			<ErrorInstancesTable
				edges={edges}
				searchedEmail={currentSearchEmail}
			/>
		</ErrorInstancesContainer>
	)
}

type ErrorInstancesContainerProps = {
	canMoveBackward: boolean
	canMoveForward: boolean
	form: FormState<SearchFormState>
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
	onPrevious?: () => void
	onNext?: () => void
	verticallyAlign?: boolean
}

const ErrorInstancesContainer: React.FC<
	React.PropsWithChildren<ErrorInstancesContainerProps>
> = ({
	canMoveBackward,
	canMoveForward,
	onPrevious,
	onNext,
	onSubmit,
	form,
	children,
	verticallyAlign = false,
}) => {
	const childrenBoxProps: BoxProps = {
		mb: '20',
		borderBottom: 'secondary',
		style: { minHeight: '351px' },
	}

	if (verticallyAlign) {
		childrenBoxProps.display = 'flex'
		childrenBoxProps.alignItems = 'center'
	}
	const hasSession = form.useValue('hasSession')
	return (
		<Stack direction="column">
			<Box my="8">
				<Form store={form} onSubmit={onSubmit}>
					<Box display="flex" alignItems="center" gap="12">
						<Box
							position="relative"
							alignItems="stretch"
							display="flex"
							color="weak"
						>
							<IconSolidSearch
								size={16}
								className={styles.searchIcon}
							/>
							<Form.Input
								name={form.names.email}
								placeholder="Search for email"
								style={{ paddingLeft: 28, width: 310 }}
							/>
						</Box>
						<Box display="flex" alignItems="center" gap="6">
							<SwitchButton
								type="submit"
								size="xxSmall"
								iconLeft={<IconSolidCheckCircle size={12} />}
								checked={hasSession}
								onChange={() => {
									form.setValue(
										form.names.hasSession,
										!hasSession,
									)
								}}
							/>
							<Text size="xSmall">
								Only instances with recorded sessions
							</Text>
						</Box>
					</Box>
				</Form>
			</Box>
			<Box {...childrenBoxProps}>{children}</Box>
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
		</Stack>
	)
}
