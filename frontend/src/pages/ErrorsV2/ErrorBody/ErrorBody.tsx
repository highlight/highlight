import BarChart from '@components/BarChart/BarChart'
import { Button } from '@components/Button'
import { GetErrorInstanceDocument } from '@graph/hooks'
import { ErrorGroup, Maybe } from '@graph/schemas'
import {
	Box,
	ButtonLink,
	IconSolidCheveronRight,
	IconSolidCode,
	IconSolidTrendingDown,
	IconSolidTrendingUp,
	Tag,
	Text,
	Tooltip,
	vars,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { getErrorGroupStats } from '@pages/ErrorsV2/utils'
import { getErrorBody } from '@util/errors/errorUtils'
import { client } from '@util/graph'
import moment from 'moment'
import React from 'react'
import { BsGridFill } from 'react-icons/bs'
import { FaUsers } from 'react-icons/fa'
import { useHistory } from 'react-router-dom'
import AutoSizer from 'react-virtualized-auto-sizer'

const showChangeThresholdPercent = 1

interface Props {
	errorGroup?: Maybe<Omit<ErrorGroup, 'metadata_log'>>
}

const ErrorBody: React.FC<React.PropsWithChildren<Props>> = ({
	errorGroup,
}) => {
	const [truncated, setTruncated] = React.useState(true)
	const [truncateable, setTruncateable] = React.useState(true)
	const { projectId } = useProjectId()
	const history = useHistory()
	const body = getErrorBody(errorGroup?.event)
	const bodyRef = React.useRef<HTMLElement | undefined>()

	const { startDate, weekly, counts, totalCount, userCount } =
		getErrorGroupStats(errorGroup)
	const usersChange = weekly.users[0]
		? ((weekly.users[1] - weekly.users[0]) / weekly.users[0]) * 100
		: 0
	const countChange = weekly.count[0]
		? ((weekly.count[1] - weekly.count[0]) / weekly.count[0]) * 100
		: 0
	const numberOfDays = moment(moment()).diff(startDate, 'days')

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
				history.push({
					pathname: `/${projectId}/errors/${errorGroup?.secure_id}/instances/${response.data.error_instance?.error_object.id}`,
					search: window.location.search,
				})

				document
					.querySelector('#error-instance-container')
					?.scrollIntoView({ behavior: 'smooth' })
			})
	}

	React.useEffect(() => {
		if (bodyRef.current) {
			setTruncateable(
				bodyRef.current.offsetHeight + 5 < bodyRef.current.scrollHeight,
			)
		}
	}, [body])

	return (
		<Box border="secondary" borderRadius="6">
			<Box display="flex">
				<Stat
					title={
						<>
							<Box
								color="n9"
								display="flex"
								alignItems="center"
								gap="4"
							>
								<FaUsers />
								<Text color="n11">Affected Users</Text>
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
					<Box display="flex" gap="4" alignItems="center">
						<Text color="black" size="large" weight="bold">
							{userCount}
						</Text>
						{Math.abs(usersChange) > showChangeThresholdPercent ? (
							<Tooltip
								trigger={
									<Tag
										kind="secondary"
										shape="basic"
										iconLeft={
											usersChange > 0 ? (
												<IconSolidTrendingUp
													size={12}
												/>
											) : (
												<IconSolidTrendingDown
													size={12}
												/>
											)
										}
									>
										<>
											{usersChange > 0 ? '+' : ''}
											{usersChange.toFixed(0)}%
										</>
									</Tag>
								}
							>
								<Box display="flex" alignItems="center" gap="4">
									<Text color="n9" size="xSmall">
										since
									</Text>
									<Box
										borderRadius="3"
										p="4"
										style={{
											boxShadow: `0 0 0 1px ${vars.color.n5}`,
											margin: -1,
										}}
									>
										<Text size="xSmall" color="n11">
											{numberOfDays}{' '}
											{numberOfDays === 1
												? 'day'
												: 'days'}
										</Text>
									</Box>
								</Box>
							</Tooltip>
						) : null}
					</Box>
				</Stat>
				<Stat
					title={
						<>
							<Box
								color="n9"
								display="flex"
								alignItems="center"
								gap="4"
							>
								<BsGridFill />
								<Text color="n11">Instances</Text>
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
					<Box display="flex" gap="4" alignItems="center">
						<Text color="black" size="large" weight="bold">
							{totalCount}
						</Text>
						{Math.abs(countChange) > showChangeThresholdPercent ? (
							<Tooltip
								trigger={
									<Tag
										kind="secondary"
										shape="basic"
										iconLeft={
											countChange > 0 ? (
												<IconSolidTrendingUp
													size={12}
												/>
											) : (
												<IconSolidTrendingDown
													size={12}
												/>
											)
										}
									>
										<>
											{countChange > 0 ? '+' : ''}
											{countChange.toFixed(0)}%
										</>
									</Tag>
								}
							>
								<Box display="flex" alignItems="center" gap="4">
									<Text color="n9" size="xSmall">
										since
									</Text>
									<Box
										borderRadius="3"
										p="4"
										style={{
											boxShadow: `0 0 0 1px ${vars.color.n5}`,
											margin: -1,
										}}
									>
										<Text size="xSmall" color="n11">
											{numberOfDays}{' '}
											{numberOfDays === 1
												? 'day'
												: 'days'}
										</Text>
									</Box>
								</Box>
							</Tooltip>
						) : null}
					</Box>
				</Stat>
				<Stat title={<Text color="n11">Last/first occurrence</Text>}>
					<Box display="flex" gap="4" alignItems="center">
						{errorGroup?.last_occurrence && (
							<Text color="black" size="large" weight="bold">
								{moment(errorGroup?.last_occurrence).fromNow(
									true,
								)}
							</Text>
						)}
						{errorGroup?.first_occurrence && (
							<Text color="n11" size="large" weight="bold">
								{' / '}
								{moment(errorGroup?.first_occurrence).fromNow(
									true,
								)}
							</Text>
						)}
					</Box>
				</Stat>

				<Stat
					title={
						<Box
							color="n9"
							display="flex"
							alignItems="center"
							gap="4"
						>
							<Text color="n11">Last 30 days</Text>
						</Box>
					}
					noBorder
				>
					<AutoSizer disableHeight>
						{({ width }) => (
							<BarChart
								data={counts || []}
								height={24}
								width={width}
								minBarHeight={5}
							/>
						)}
					</AutoSizer>
				</Stat>
			</Box>
			<Box py="12" px="16">
				<Box mb="20" display="flex" gap="6" alignItems="center">
					<IconSolidCode size={14} color={vars.color.n11} />
					<Text color="n11">Error Body</Text>
				</Box>

				<Text
					family="monospace"
					lines={truncated ? '3' : undefined}
					ref={bodyRef}
					break="word"
				>
					{body}
				</Text>

				{truncateable && (
					<Box mt="8">
						<Button
							onClick={() => setTruncated(!truncated)}
							kind="secondary"
							emphasis="medium"
							size="xSmall"
							trackingId="errorBodyToggleContent"
						>
							Show {truncated ? 'more' : 'less'}
						</Button>
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
