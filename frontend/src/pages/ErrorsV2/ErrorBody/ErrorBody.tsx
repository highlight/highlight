import BarChart from '@components/BarChart/BarChart'
import { useGetErrorGroupFrequenciesQuery } from '@graph/hooks'
import { ErrorGroup, Maybe } from '@graph/schemas'
import { Box, ButtonLink, Text, TextLink } from '@highlight-run/ui'
import { getErrorBody } from '@util/errors/errorUtils'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import React from 'react'
import { BsGridFill } from 'react-icons/bs'
import { FaUsers } from 'react-icons/fa'

interface Props {
	errorGroup?: Maybe<Pick<ErrorGroup, 'event' | 'secure_id'>>
}

const ErrorBody: React.FC<React.PropsWithChildren<Props>> = ({
	errorGroup,
}) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const [truncated, setTruncated] = React.useState(true)
	const [truncateable, setTruncateable] = React.useState(true)
	const body = getErrorBody(errorGroup?.event)
	const bodyRef = React.useRef<HTMLElement | undefined>()
	const endDate = React.useRef<moment.Moment>(moment())

	const { data: frequencies } = useGetErrorGroupFrequenciesQuery({
		variables: {
			project_id,
			error_group_secure_ids: [errorGroup?.secure_id || ''],
			params: {
				date_range: {
					start_date: moment(endDate.current)
						.subtract(30, 'days')
						.format(),
					end_date: endDate.current.format(),
				},
				resolution_hours: 24,
			},
		},
		skip: !errorGroup?.secure_id,
	})
	const countBuckets =
		frequencies?.errorGroupFrequencies
			.filter((x) => x?.name === 'count')
			.map((x) => x?.value || 0) || []

	React.useEffect(() => {
		if (bodyRef.current) {
			setTruncateable(
				bodyRef.current.offsetHeight + 5 < bodyRef.current.scrollHeight,
			)
		}
	}, [body])

	return (
		<Box border="neutral" borderRadius="6">
			<Box display="flex">
				<Stat
					title={
						<Box
							color="neutral300"
							display="flex"
							alignItems="center"
							gap="4"
						>
							<FaUsers />
							<Text color="neutral500">Users</Text>
						</Box>
					}
				>
					<Box display="flex" gap="4" alignItems="center">
						<Text color="black" size="large" weight="bold">
							25
						</Text>
						<Tag>
							<>+23.7% since Sep 15</>
						</Tag>
					</Box>
				</Stat>
				<Stat
					title={
						<>
							<Box
								color="neutral300"
								display="flex"
								alignItems="center"
								gap="4"
							>
								<BsGridFill />
								<Text color="neutral500">Instances</Text>
							</Box>
							<Text>
								<TextLink
									href={`${window.location.pathname}${window.location.search}#error-instance-container`}
								>
									Latest {'>'}
								</TextLink>
							</Text>
						</>
					}
				>
					<Box display="flex" gap="4" alignItems="center">
						<Text color="black" size="large" weight="bold">
							32
						</Text>
						<Tag>
							<>+23.7% since Sep 15</>
						</Tag>
					</Box>
				</Stat>
				<Stat
					title={
						<Text color="neutral500">Last/first occurrence</Text>
					}
				>
					<Box display="flex" gap="4" alignItems="center">
						<Text color="black" size="large" weight="bold">
							25
						</Text>
						<Text color="neutral500" size="large" weight="bold">
							{' '}
							/ Sep 13
						</Text>
					</Box>
				</Stat>

				<Stat
					title={
						<Box
							color="neutral300"
							display="flex"
							alignItems="center"
							gap="4"
						>
							<Text color="neutral500">Last 30 days</Text>
						</Box>
					}
					noBorder
				>
					<Box display="flex" gap="4" alignItems="center">
						<BarChart data={countBuckets} height={30} width={300} />
					</Box>
				</Stat>
			</Box>
			<Box py="12" px="16">
				<Text
					family="monospace"
					lines={truncated ? '3' : undefined}
					ref={bodyRef}
				>
					{body}
				</Text>

				{truncateable && (
					<Box mt="12">
						<ButtonLink onClick={() => setTruncated(!truncated)}>
							Show {truncated ? 'more' : 'less'}
						</ButtonLink>
					</Box>
				)}
			</Box>
		</Box>
	)
}

const Stat: React.FC<
	React.PropsWithChildren<{ title: React.ReactElement; noBorder?: boolean }>
> = ({ title, children, noBorder = false }) => (
	<Box
		borderBottom="neutral"
		borderRight={noBorder ? undefined : 'neutral'}
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

const Tag: React.FC<{ children: React.ReactElement }> = ({ children }) => (
	<Box as="span" background="neutral100" borderRadius="4" p="4">
		<Text color="black">{children}</Text>
	</Box>
)

export default ErrorBody
