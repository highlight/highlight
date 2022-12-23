import BarChart from '@components/BarChart/BarChart'
import { ErrorGroup, ErrorState, Maybe } from '@graph/schemas'
import {
	Box,
	IconSolidSparkles,
	IconSolidSquare_2Stack,
	IconSolidUsers,
	Tag,
	Text,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { formatErrorGroupDate, getErrorGroupStats } from '@pages/ErrorsV2/utils'
import { getErrorBody } from '@util/errors/errorUtils'
import { useParams } from '@util/react-router/useParams'
import { Link } from 'react-router-dom'

import * as style from './ErrorFeedCard.css'
interface Props {
	errorGroup: Maybe<Omit<ErrorGroup, 'metadata_log'>>
	urlParams?: string
}
export const ErrorFeedCard = ({ errorGroup, urlParams }: Props) => {
	const { projectId } = useProjectId()
	const { error_secure_id } = useParams<{
		error_secure_id?: string
	}>()
	const body = getErrorBody(errorGroup?.event)
	const createdDate = formatErrorGroupDate(errorGroup?.created_at)
	const updatedDate = formatErrorGroupDate(errorGroup?.updated_at)

	const { totalCount, userCount } = getErrorGroupStats(errorGroup)

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
					color="n12"
					display="flex"
					alignItems="center"
					cssClass={style.errorCardTitle}
				>
					<Text
						lines="1"
						size="small"
						color="n12"
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
								kind={
									errorGroup?.state === ErrorState.Resolved
										? 'primary'
										: 'secondary'
								}
								emphasis={
									errorGroup?.state === ErrorState.Open
										? 'medium'
										: 'high'
								}
							>
								<Text transform="capitalize">
									{errorGroup?.state.toLowerCase()}
								</Text>
							</Tag>
							<Tag
								shape="basic"
								kind="secondary"
								emphasis="low"
								iconLeft={<IconSolidUsers size={12} />}
							>
								<Text>{userCount}</Text>
							</Tag>
							<Tag
								shape="basic"
								kind="secondary"
								emphasis="low"
								iconLeft={<IconSolidSquare_2Stack size={12} />}
							>
								<Text>{totalCount}</Text>
							</Tag>
						</Box>
						<Box display="flex" gap="4" alignItems="center">
							<Tag shape="basic" kind="secondary">
								{updatedDate}
							</Tag>
							<Tag
								shape="basic"
								kind="secondary"
								iconLeft={<IconSolidSparkles size={12} />}
							>
								{createdDate}
							</Tag>
						</Box>
					</Box>
					<Box paddingTop="2" display="flex" alignItems="flex-end">
						<BarChart
							data={errorGroup?.error_frequency || []}
							height={38}
							width={51}
							selected={errorGroup?.secure_id === error_secure_id}
							minBarHeight={5}
						/>
					</Box>
				</Box>
			</Box>
		</Link>
	)
}
