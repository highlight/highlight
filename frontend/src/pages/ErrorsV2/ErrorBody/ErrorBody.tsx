import { ErrorGroup, Maybe } from '@graph/schemas'
import { Box } from '@highlight-run/ui'
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
								display="flex"
								alignItems="center"
								gap="xSmall"
							>
								<FaUsers />
								<span>Users</span>
							</Box>
							<Box color="purple700" as="a">
								Metrics {'>'}
							</Box>
						</Box>

						<Box display="flex" gap="xSmall" alignItems="center">
							<Box
								as="span"
								fontSize="medium"
								fontWeight="medium"
								color="neutral800"
							>
								25
							</Box>
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
								display="flex"
								alignItems="center"
								gap="xSmall"
							>
								<BsGridFill />
								<span>Instances</span>
							</Box>
							<Box color="purple700" as="a">
								Latest {'>'}
							</Box>
						</Box>

						<Box display="flex" gap="xSmall" alignItems="center">
							<Box
								as="span"
								fontSize="medium"
								fontWeight="medium"
								color="neutral800"
							>
								32
							</Box>
							<Tag>
								<>+23.7% since Sep 15</>
							</Tag>
						</Box>
					</>
				</Stat>
				<Stat>
					<>
						<Box display="flex" alignItems="center" gap="xSmall">
							<FaUsers />
							<span>Users</span>
						</Box>

						<Box display="flex" gap="xSmall" alignItems="center">
							<Box
								as="span"
								fontSize="medium"
								fontWeight="medium"
								color="neutral800"
							>
								25
							</Box>
							<Box
								as="span"
								fontSize="medium"
								fontWeight="medium"
							>
								/
							</Box>
							<Box
								as="span"
								fontSize="medium"
								fontWeight="medium"
							>
								Sep 13
							</Box>
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
								display="flex"
								alignItems="center"
								gap="xSmall"
							>
								<FaUsers />
								<span>Last 30 days</span>
							</Box>
							<Box color="purple700" as="a">
								Metrics {'>'}
							</Box>
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
		color="neutral500"
		px="medium"
		py="small"
		flex="stretch"
	>
		{children}
	</Box>
)

const Tag: React.FC<{ children: React.ReactElement }> = ({ children }) => (
	<Box
		as="span"
		background="neutral100"
		borderRadius="small"
		p="xSmall"
		display="flex"
		lineHeight="1"
	>
		{children}
	</Box>
)

export default ErrorBody
