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
		<Box border="neutral" borderRadius="medium">
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
								gap="xSmall"
							>
								<FaUsers />
								<Text>Users</Text>
							</Box>
							<Text color="purple700">Metrics {'>'}</Text>
						</Box>

						<Box display="flex" gap="xSmall" alignItems="center">
							<Text color="black" variant="largeBold">
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
								gap="xSmall"
							>
								<BsGridFill />
								<Text>Instances</Text>
							</Box>
							<Box color="purple700" as="a">
								Latest {'>'}
							</Box>
						</Box>

						<Box display="flex" gap="xSmall" alignItems="center">
							<Text color="black" variant="largeBold">
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
							gap="xSmall"
						>
							<FaUsers />
							<Text>Users</Text>
						</Box>

						<Box display="flex" gap="xSmall" alignItems="center">
							<Text color="black" variant="largeBold">
								25
							</Text>
							<Text color="neutral500" variant="largeBold">
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
								gap="xSmall"
							>
								<FaUsers />
								<Text>Last 30 days</Text>
							</Box>
							<Text color="purple700">Metrics {'>'}</Text>
						</Box>

						<Box display="flex" gap="xSmall" alignItems="center">
							TODO: Histogram
						</Box>
					</>
				</Stat>
			</Box>
			<Box p="medium">
				<code>{body}</code>
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
		px="medium"
		py="small"
		flex="stretch"
	>
		<Box display="flex" flexDirection="column" gap="small">
			{children}
		</Box>
	</Box>
)

const Tag: React.FC<{ children: React.ReactElement }> = ({ children }) => (
	<Box as="span" background="neutral100" borderRadius="small" p="xSmall">
		<Text color="black">{children}</Text>
	</Box>
)

export default ErrorBody
