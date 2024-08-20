import BarChart from '@components/BarChart/BarChart'
import { ErrorGroup, ErrorState, Maybe } from '@graph/schemas'
import {
	Badge,
	Box,
	IconSolidSparkles,
	IconSolidUsers,
	IconSolidViewGrid,
	Tag,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useProjectId } from '@hooks/useProjectId'
import { formatErrorGroupDate, getErrorGroupStats } from '@pages/ErrorsV2/utils'
import { getErrorBody } from '@util/errors/errorUtils'
import { useParams } from '@util/react-router/useParams'
import moment from 'moment'
import { Link } from 'react-router-dom'

import * as style from './ErrorFeedCard.css'

type ErrorGroupType = Maybe<Omit<ErrorGroup, 'metadata_log'>>
interface Props {
	errorGroup: ErrorGroupType
	onClick?: React.MouseEventHandler<HTMLAnchorElement>
}
export const ErrorFeedCard = ({ errorGroup, onClick }: Props) => {
	const { projectId } = useProjectId()
	const { error_secure_id } = useParams<{
		error_secure_id?: string
	}>()
	const body = getErrorBody(errorGroup?.event)
	const firstInstance = formatErrorGroupDate(
		errorGroup?.first_occurrence || errorGroup?.created_at,
	)
	const lastInstance = formatErrorGroupDate(
		errorGroup?.last_occurrence || errorGroup?.updated_at,
	)

	const { totalCount, userCount } = getErrorGroupStats(errorGroup)
	const snoozed =
		errorGroup?.snoozed_until &&
		moment().isBefore(moment(errorGroup.snoozed_until))

	return (
		<Link
			to={
				onClick
					? {
							pathname: location.pathname,
							search: location.search,
						}
					: {
							pathname: `/${projectId}/errors/${errorGroup?.secure_id}`,
							search: location.search,
						}
			}
			onClick={onClick}
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
					justifyContent="space-between"
					gap="4"
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
					{recentlyCreated(errorGroup) && (
						<Badge variant="yellow" label="New" size="medium" />
					)}
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
							{snoozed && (
								<Tooltip
									trigger={
										<Tag
											shape="basic"
											kind="secondary"
											emphasis="high"
										>
											<Text>Snoozed</Text>
										</Tag>
									}
								>
									<Box
										display="flex"
										alignItems="center"
										gap="4"
									>
										<Text color="n9" size="xSmall">
											Snoozed until{' '}
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
												{moment(
													errorGroup.snoozed_until,
												).format('ddd, h:mm A')}
											</Text>
										</Box>
									</Box>
								</Tooltip>
							)}
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
								iconLeft={<IconSolidViewGrid size={12} />}
							>
								<Text>{totalCount}</Text>
							</Tag>
						</Box>
						<Box display="flex" gap="4" alignItems="center">
							<Tag shape="basic" kind="secondary">
								{lastInstance}
							</Tag>
							<Tag
								shape="basic"
								kind="secondary"
								iconLeft={<IconSolidSparkles size={12} />}
							>
								{firstInstance}
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

const recentlyCreated = (errorGroup: ErrorGroupType) => {
	const createdAt = moment(errorGroup?.created_at)
	return createdAt.isAfter(moment().subtract(3, 'day'))
}
