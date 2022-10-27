import { ErrorGroup, Maybe } from '@graph/schemas'
import { Box, Text } from '@highlight-run/ui'
import { getErrorBody } from '@util/errors/errorUtils'
import React from 'react'
import { BsGridFill } from 'react-icons/bs'
import { FaUsers } from 'react-icons/fa'

interface Props {
	errorGroup?: Maybe<Pick<ErrorGroup, 'event'>>
}

const ErrorBody: React.FC<React.PropsWithChildren<Props>> = ({
	errorGroup,
}) => {
	const body = getErrorBody(errorGroup?.event)

	return (
		<Box border="neutral" borderRadius="6">
			<Box display="flex">
				<Stat>
					<>
						<Box
							display="flex"
							justifyContent="space-between"
							flexDirection="row"
							alignItems="center"
						>
							<Box
								color="neutral300"
								display="flex"
								alignItems="center"
								gap="4"
							>
								<FaUsers />
								<Text>Users</Text>
							</Box>
							<Text color="purple700">Metrics {'>'}</Text>
						</Box>

						<Box display="flex" gap="4" alignItems="center">
							<Text color="black" size="large">
								25
							</Text>
							<Tag>
								<>+23.7% since Sep 15</>
							</Tag>
						</Box>
					</>
				</Stat>
				<Stat>
					<>
						<Box
							display="flex"
							justifyContent="space-between"
							flexDirection="row"
							alignItems="center"
						>
							<Box
								color="neutral300"
								display="flex"
								alignItems="center"
								gap="4"
							>
								<BsGridFill />
								<Text>Instances</Text>
							</Box>
							<Text color="purple700">Latest {'>'}</Text>
						</Box>

						<Box display="flex" gap="4" alignItems="center">
							<Text color="black" size="large">
								32
							</Text>
							<Tag>
								<>+23.7% since Sep 15</>
							</Tag>
						</Box>
					</>
				</Stat>
				<Stat>
					<>
						<Box
							color="neutral300"
							display="flex"
							alignItems="center"
							gap="4"
						>
							<FaUsers />
							<Text>Users</Text>
						</Box>

						<Box display="flex" gap="4" alignItems="center">
							<Text color="black" size="large">
								25
							</Text>
							<Text color="neutral500" size="large">
								{' '}
								/ Sep 13
							</Text>
						</Box>
					</>
				</Stat>

				<Stat noBorder>
					<>
						<Box
							display="flex"
							justifyContent="space-between"
							flexDirection="row"
							alignItems="center"
						>
							<Box
								color="neutral300"
								display="flex"
								alignItems="center"
								gap="4"
							>
								<FaUsers />
								<Text>Last 30 days</Text>
							</Box>
							<Text color="purple700">Metrics {'>'}</Text>
						</Box>

						<Box display="flex" gap="4" alignItems="center">
							TODO: Histogram
						</Box>
					</>
				</Stat>
			</Box>
			<Box p="10">
				<Text size="monospace">{body}</Text>
			</Box>
		</Box>
	)
}

const Stat: React.FC<{ children: React.ReactElement; noBorder?: boolean }> = ({
	children,
	noBorder = false,
}) => (
	<Box
		borderBottom="neutral"
		borderRight={noBorder ? undefined : 'neutral'}
		px="10"
		py="8"
		flex="stretch"
	>
		<Box display="flex" flexDirection="column" gap="6">
			{children}
		</Box>
	</Box>
)

const Tag: React.FC<{ children: React.ReactElement }> = ({ children }) => (
	<Box as="span" background="neutral100" borderRadius="4" p="4">
		<Text color="black">{children}</Text>
	</Box>
)

export default ErrorBody
