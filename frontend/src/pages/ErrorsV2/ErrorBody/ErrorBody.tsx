import BarChart from '@components/BarChart/BarChart'
import { ErrorGroup, Maybe } from '@graph/schemas'
import {
	Box,
	ButtonLink,
	IconChevronRight,
	Text,
	TextLink,
} from '@highlight-run/ui'
import { formatErrorGroupDate, getErrorGroupStats } from '@pages/ErrorsV2/utils'
import { getErrorBody } from '@util/errors/errorUtils'
import moment from 'moment'
import React from 'react'
import { BsGridFill } from 'react-icons/bs'
import { FaUsers } from 'react-icons/fa'
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
							{userCount}
						</Text>
						{Math.abs(usersChange) > showChangeThresholdPercent ? (
							<Tag>
								<>
									{usersChange > 0 ? '+' : ''}
									{usersChange.toFixed(0)}% since{' '}
									{formatErrorGroupDate(startDate.format())}
								</>
							</Tag>
						) : null}
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
									<Box
										display="flex"
										alignItems="center"
										as="span"
									>
										<span>Latest</span>{' '}
										<IconChevronRight size={16} />
									</Box>
								</TextLink>
							</Text>
						</>
					}
				>
					<Box display="flex" gap="4" alignItems="center">
						<Text color="black" size="large" weight="bold">
							{totalCount}
						</Text>
						{Math.abs(countChange) > showChangeThresholdPercent ? (
							<Tag>
								<>
									{countChange > 0 ? '+' : ''}
									{countChange.toFixed(0)}% since{' '}
									{formatErrorGroupDate(startDate.format())}
								</>
							</Tag>
						) : null}
					</Box>
				</Stat>
				<Stat
					title={
						<Text color="neutral500">Last/first occurrence</Text>
					}
				>
					<Box display="flex" gap="4" alignItems="center">
						{errorGroup?.last_occurrence && (
							<Text color="black" size="large" weight="bold">
								{moment(errorGroup?.last_occurrence).fromNow(
									true,
								)}
							</Text>
						)}
						{errorGroup?.first_occurrence && (
							<Text color="neutral500" size="large" weight="bold">
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
	<Box as="span" backgroundColor="neutral100" borderRadius="4" p="4">
		<Text color="black">{children}</Text>
	</Box>
)

export default ErrorBody
