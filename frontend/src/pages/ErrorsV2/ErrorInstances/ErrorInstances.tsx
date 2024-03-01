import {
	Box,
	BoxProps,
	Callout,
	Form,
	IconSolidCheckCircle,
	IconSolidSearch,
	Stack,
	SwitchButton,
	Text,
} from '@highlight-run/ui/components'
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
	const [args, setArgs] = useState<SearchFormState>({
		email: '',
		hasSession: hasSessionDefault,
	})
	const [query, setQuery] = useState<{
		query: string
		pagination: Pagination
	}>({
		query: hasSessionDefault ? 'has_session:true ' : '',
		pagination: {
			after: null,
			before: null,
		},
	})

	const { data, loading, error } = useGetErrorObjectsQuery({
		variables: {
			errorGroupSecureID: errorGroup?.secure_id ?? '',
			after: query.pagination.after,
			before: query.pagination.before,
			query: query.query,
		},
		skip: !errorGroup?.secure_id,
	})

	const handleSubmit = ({ email, hasSession }: SearchFormState) => {
		setArgs({ hasSession, email })
		setQuery({
			query: `${hasSession ? 'has_session:true ' : ''}email:${email}`,
			pagination: {
				after: null,
				before: null,
			},
		})
		setCurrentSearchEmail(email)
	}

	React.useEffect(() => {
		setHasSessionDefault(args.hasSession)
	}, [args.hasSession, setHasSessionDefault])

	if (loading) {
		return (
			<ErrorInstancesContainer
				canMoveBackward={false}
				canMoveForward={false}
				args={args}
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
				args={args}
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
		setQuery((q) => ({
			query: q.query,
			pagination: {
				after: null,
				before: data.error_objects.pageInfo.startCursor,
			},
		}))
	}

	const handleNextPage = () => {
		setQuery((q) => ({
			query: q.query,
			pagination: {
				after: data.error_objects.pageInfo.endCursor,
				before: null,
			},
		}))
	}

	const edges: ErrorObjectEdge[] =
		data.error_objects?.edges.map((edge) => edge) || []

	if (edges.length === 0) {
		return (
			<ErrorInstancesContainer
				canMoveBackward={false}
				canMoveForward={false}
				args={args}
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
			args={args}
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
	args: SearchFormState
	onSubmit: ({ email, hasSession }: SearchFormState) => void
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
	args,
	children,
	verticallyAlign = false,
}) => {
	const form = Form.useStore<{ email: string }>({
		defaultValues: {
			email: '',
		},
	})
	const childrenBoxProps: BoxProps = {
		mb: '20',
		borderBottom: 'secondary',
		style: { minHeight: '351px' },
	}

	if (verticallyAlign) {
		childrenBoxProps.display = 'flex'
		childrenBoxProps.alignItems = 'center'
	}
	return (
		<Stack direction="column">
			<Box my="8">
				<Box display="flex" alignItems="center" gap="12">
					<Box
						position="relative"
						alignItems="stretch"
						display="flex"
						flexGrow={1}
						color="weak"
					>
						<IconSolidSearch
							size={16}
							className={styles.searchIcon}
						/>
						<Form
							style={{ width: '100%' }}
							store={form}
							onChange={() => {
								onSubmit({
									email: form.getValue('email'),
									hasSession: args.hasSession,
								})
							}}
						>
							<Form.Input
								name={form.names.email}
								placeholder="Search for email"
								style={{ paddingLeft: 28, width: '100%' }}
							/>
						</Form>
						<Box
							position="absolute"
							display="flex"
							justifyContent="flex-end"
							alignItems="center"
							gap="6"
							height="full"
							style={{ right: 8 }}
						>
							<SwitchButton
								type="button"
								size="xxSmall"
								iconLeft={<IconSolidCheckCircle size={12} />}
								checked={args.hasSession}
								onChange={() => {
									onSubmit({
										email: args.email,
										hasSession: !args.hasSession,
									})
								}}
							/>
							<Text size="xSmall">
								Only instances with recorded sessions
							</Text>
						</Box>
					</Box>
				</Box>
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
