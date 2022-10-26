import BarChart from '@components/BarChart/BarChart'
import { ErrorGroup, Maybe } from '@graph/schemas'
import { Box, Text } from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { ReactComponent as UsersIcon } from '@icons/Solid/users.svg'
import { getErrorBody } from '@util/errors/errorUtils'
import { useParams } from '@util/react-router/useParams'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import style from './ErrorFeedCard.module.scss'
interface Props {
	errorGroup: Maybe<ErrorGroup>
	urlParams?: string
}
export const ErrorFeedCard = ({ errorGroup, urlParams }: Props) => {
	const { projectId } = useProjectId()
	const { error_secure_id } = useParams<{
		error_secure_id?: string
	}>()
	const body = getErrorBody(errorGroup?.event)
	const date = errorGroup?.created_at
		? `Since ${new Date(errorGroup?.created_at).toLocaleString('en-us', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
		  })}`
		: ''

	const [frequencies, setFrequencies] = useState<Array<number>>(
		Array(6).fill(0),
	)
	useEffect(() => {
		if (errorGroup?.error_frequency.length) {
			setFrequencies(errorGroup.error_frequency)
		}
	}, [errorGroup?.error_frequency])

	// TODO: replace this with an aggregate count from openSearch
	const errorCount = frequencies.reduce((acc, curr) => acc + curr, 0)
	const userCount = 5

	return (
		<Link
			to={`/${projectId}/errors/${errorGroup?.secure_id}${
				urlParams || ''
			}`}
		>
			<Box
				paddingTop="small"
				paddingBottom="narrow"
				px="medium"
				borderRadius="tiny"
				display="flex"
				flexDirection="column"
				gap="xSmall"
				cssClass={[
					style.errorCard,
					{
						[style.errorCardSelected]:
							errorGroup?.secure_id === error_secure_id,
					},
				]}
			>
				<Box cssClass={style.title} color="dark">
					<Text as="span" size="small" weight="semibold" color="dark">
						{body}
					</Text>
				</Box>
				<Box display="flex" gap="medium" justifyContent="space-between">
					<Box
						display="flex"
						flexDirection="column"
						gap="tiny"
						justifyContent="space-between"
					>
						<Box display="flex" gap="tiny">
							<Box
								border="neutral"
								borderRadius="xSmall"
								px="xSmall"
								py="xxSmall"
								display="flex"
								alignItems="center"
								gap="xxSmall"
								cssClass={style.badge}
							>
								<UsersIcon className={style.icon} />
								<Text
									size="xSmall"
									weight="semibold"
									color="neutral700"
									as="span"
								>
									{errorCount}
								</Text>
							</Box>
							<Box
								border="neutral"
								borderRadius="xSmall"
								px="xSmall"
								py="xxSmall"
								display="flex"
								alignItems="center"
								gap="xxSmall"
								cssClass={style.badge}
							>
								<UsersIcon className={style.icon} />
								<Text
									size="xSmall"
									weight="semibold"
									color="neutral700"
									as="span"
								>
									{userCount}
								</Text>
							</Box>
						</Box>
						<Box>
							<Text
								as="span"
								size="xSmall"
								weight="semibold"
								color="neutral700"
							>
								{date}
							</Text>
						</Box>
					</Box>
					<Box
						paddingTop="xxSmall"
						display="flex"
						alignItems="flex-end"
					>
						<BarChart data={frequencies} height={34} width={51} />
					</Box>
				</Box>
			</Box>
		</Link>
	)
}
