import { ErrorGroup, Maybe } from '@graph/schemas'
import { Box, Text, TextLink } from '@highlight-run/ui'
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
							<Text>
								<TextLink href="#metrics">
									Metrics {'>'}
								</TextLink>
							</Text>
						</Box>

						<Box display="flex" gap="4" alignItems="center">
							<Text color="black" size="large" weight="bold">
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
							<Text>
								<TextLink href="#latest">Latest {'>'}</TextLink>
							</Text>
						</Box>

						<Box display="flex" gap="4" alignItems="center">
							<Text color="black" size="large" weight="bold">
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
							<Text color="black" size="large" weight="bold">
								25
							</Text>
							<Text color="neutral500" size="large" weight="bold">
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
							<Text>
								<TextLink href="#metrics">
									Metrics {'>'}
								</TextLink>
							</Text>
						</Box>

						<Box display="flex" gap="4" alignItems="center">
							TODO: Histogram
						</Box>
					</>
				</Stat>
			</Box>
			<Box py="12" px="16">
				<Text family="monospace">{body}</Text>
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
		px="16"
		py="12"
		flex="stretch"
	>
		<Box
			display="flex"
			flexDirection="column"
			gap="6"
			justifyContent="space-between"
			style={{ height: '100%' }}
		>
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
