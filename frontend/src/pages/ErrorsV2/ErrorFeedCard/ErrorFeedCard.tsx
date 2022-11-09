import BarChart from '@components/BarChart/BarChart'
import styles from '@components/RadioGroup/RadioGroup.module'
import { ErrorGroup, ErrorState, Maybe } from '@graph/schemas'
import {
	Box,
	IconSparkles,
	IconUsers,
	IconViewGrid,
	Tag,
	Text,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { getErrorBody } from '@util/errors/errorUtils'
import { useParams } from '@util/react-router/useParams'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import * as style from './ErrorFeedCard.css'
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
	const createdDate = errorGroup?.created_at
		? `${new Date(errorGroup.created_at).toLocaleString('en-us', {
				day: 'numeric',
				month: 'short',
				year:
					new Date().getFullYear() !==
					new Date(errorGroup.created_at).getFullYear()
						? 'numeric'
						: undefined,
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

	// TODO: replace this with the data from the new backend
	const errorCount = frequencies.reduce((acc, curr) => acc + curr, 0)
	const userCount = 5
	const updatedDate = 'Yesterday'

	return (
		<Link
			to={`/${projectId}/errors/${errorGroup?.secure_id}${
				urlParams || ''
			}`}
		>
			<Box
				paddingTop="8"
				paddingBottom="10"
				px={`${style.ERROR_CARD_PX}`}
				borderRadius="6"
				display="flex"
				flexDirection="column"
				gap="4"
				cssClass={[
					style.errorCard,
					{
						[style.errorCardSelected]:
							errorGroup?.secure_id === error_secure_id,
					},
				]}
			>
				<Box
					color="dark"
					display="flex"
					alignItems="center"
					cssClass={style.errorCardTitle}
				>
					<Text
						lines="1"
						size="small"
						color="dark"
						display="flex"
						cssClass={style.errorCardTitleText}
					>
						{body}
					</Text>
				</Box>
				<Box display="flex" gap="12" justifyContent="space-between">
					<Box
						display="flex"
						flexDirection="column"
						gap="6"
						justifyContent="space-between"
					>
						<Box display="flex" gap="4" alignItems="center">
							<Tag
								shape="basic"
								variant={
									errorGroup?.state === ErrorState.Resolved
										? 'primary'
										: errorGroup?.state ===
										  ErrorState.Ignored
										? 'grey'
										: 'white'
								}
							>
								<Text transform="capitalize">
									{errorGroup?.state.toLowerCase()}
								</Text>
							</Tag>
							<Tag
								shape="basic"
								variant="transparent"
								iconLeft={<IconUsers size={12} />}
							>
								<Text>{userCount}</Text>
							</Tag>
							<Tag
								shape="basic"
								variant="transparent"
								iconLeft={<IconViewGrid size={12} />}
							>
								<Text>{errorCount}</Text>
							</Tag>
						</Box>
						<Box display="flex" gap="4" alignItems="center">
							<Tag shape="basic" variant="grey">
								{updatedDate}
							</Tag>
							<Tag
								shape="basic"
								variant="grey"
								iconLeft={<IconSparkles size={12} />}
							>
								{createdDate}
							</Tag>
						</Box>
					</Box>
					<Box paddingTop="2" display="flex" alignItems="flex-end">
						<BarChart data={frequencies} height={34} width={51} />
					</Box>
				</Box>
			</Box>
		</Link>
	)
}
