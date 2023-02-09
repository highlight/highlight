import { GetErrorInstanceDocument } from '@graph/hooks'
import { ErrorGroup, Maybe } from '@graph/schemas'
import {
	Box,
	ButtonLink,
	IconSolidCheveronRight,
	IconSolidCode,
	IconSolidUsers,
	IconSolidViewGrid,
	Text,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import AffectedUserCount from '@pages/ErrorsV2/ErrorBody/components/AffectedUserCount'
import ErrorBodyText from '@pages/ErrorsV2/ErrorBody/components/ErrorBodyText'
import ErrorFrequencyChart from '@pages/ErrorsV2/ErrorBody/components/ErrorFrequencyChart'
import ErrorObjectCount from '@pages/ErrorsV2/ErrorBody/components/ErrorObjectCount'
import ErrorOccurenceDate from '@pages/ErrorsV2/ErrorBody/components/ErrorOccurenceDate'
import { client } from '@util/graph'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export const showChangeThresholdPercent = 1

interface Props {
	errorGroup?: Maybe<Omit<ErrorGroup, 'metadata_log'>>
}

const ErrorBody: React.FC<React.PropsWithChildren<Props>> = ({
	errorGroup,
}) => {
	const { projectId } = useProjectId()
	const navigate = useNavigate()

	const scrollToInstances = () => {
		// Using client directly here because there was some issues with the
		// onCompleted handler competing with the logic already in ErrorInstance.
		client
			.query({
				query: GetErrorInstanceDocument,
				variables: {
					error_group_secure_id: String(errorGroup?.secure_id),
				},
			})
			.then((response) => {
				if (response.data.error_instance?.error_object.id) {
					navigate({
						pathname: `/${projectId}/errors/${errorGroup?.secure_id}/instances/${response.data.error_instance?.error_object.id}`,
						search: window.location.search,
					})
				}

				document
					.querySelector('#error-instance-container')
					?.scrollIntoView({ behavior: 'smooth' })
			})
	}

	return (
		<Box border="secondary" borderRadius="6">
			<Box display="flex">
				<Stat
					title={
						<>
							<Box
								color="weak"
								display="flex"
								alignItems="center"
								gap="4"
							>
								<IconSolidUsers />
								<Text color="moderate">Affected Users</Text>
							</Box>
							<ButtonLink
								style={{ cursor: 'pointer' }}
								onClick={scrollToInstances}
							>
								<Box
									display="flex"
									alignItems="center"
									as="span"
								>
									<span>Latest</span>{' '}
									<IconSolidCheveronRight size={16} />
								</Box>
							</ButtonLink>
						</>
					}
				>
					<AffectedUserCount errorGroup={errorGroup} />
				</Stat>
				<Stat
					title={
						<>
							<Box
								color="weak"
								display="flex"
								alignItems="center"
								gap="4"
							>
								<IconSolidViewGrid />
								<Text color="moderate">Instances</Text>
							</Box>
							<ButtonLink
								style={{ cursor: 'pointer' }}
								onClick={scrollToInstances}
							>
								<Box
									display="flex"
									alignItems="center"
									as="span"
								>
									<span>Latest</span>{' '}
									<IconSolidCheveronRight size={16} />
								</Box>
							</ButtonLink>
						</>
					}
				>
					<ErrorObjectCount errorGroup={errorGroup} />
				</Stat>
				<Stat
					title={<Text color="moderate">Last/first occurrence</Text>}
				>
					<ErrorOccurenceDate errorGroup={errorGroup} />
				</Stat>

				<Stat
					title={<Text color="moderate">Last 30 days</Text>}
					noBorder
				>
					<ErrorFrequencyChart errorGroup={errorGroup} />
				</Stat>
			</Box>
			<Box py="12" px="16">
				<Box
					mb="20"
					display="flex"
					gap="6"
					alignItems="center"
					color="weak"
				>
					<IconSolidCode />
					<Text color="moderate">Error Body</Text>
				</Box>
				<ErrorBodyText errorGroup={errorGroup} />
			</Box>
		</Box>
	)
}

const Stat: React.FC<
	React.PropsWithChildren<{ title: React.ReactElement; noBorder?: boolean }>
> = ({ title, children, noBorder = false }) => (
	<Box
		borderBottom="secondary"
		borderRight={noBorder ? undefined : 'secondary'}
		px="16"
		py="12"
		flex="stretch"
	>
		<Box
			display="flex"
			flexDirection="column"
			gap="12"
			justifyContent="space-between"
			style={{ height: '100%' }}
		>
			<Box
				display="flex"
				justifyContent="space-between"
				flexDirection="row"
				alignItems="center"
			>
				{title}
			</Box>

			<Box display="flex" alignItems="center" style={{ height: 24 }}>
				{children}
			</Box>
		</Box>
	</Box>
)

export default ErrorBody
