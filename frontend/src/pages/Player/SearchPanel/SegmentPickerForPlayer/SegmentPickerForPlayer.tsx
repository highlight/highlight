import { namedOperations } from '@graph/operations'
import SvgXIcon from '@icons/XIcon'
import { message, Select as AntDesignSelect } from 'antd'
import classNames from 'classnames'
const { Option } = AntDesignSelect
import { getQueryFromParams } from '@pages/Sessions/SessionsFeedV2/components/SessionsQueryBuilder/SessionsQueryBuilder'
import { useParams } from '@util/react-router/useParams'
import _ from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import TextTransition from 'react-text-transition'

import Button from '../../../../components/Button/Button/Button'
import Select from '../../../../components/Select/Select'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import {
	useEditSegmentMutation,
	useGetSegmentsQuery,
} from '../../../../graph/generated/hooks'
import SvgEditIcon from '../../../../static/EditIcon'
import SvgPlusIcon from '../../../../static/PlusIcon'
import { gqlSanitize } from '../../../../util/gqlSanitize'
import { EmptySessionsSearchParams } from '../../../Sessions/EmptySessionsSearchParams'
import { useSearchContext } from '../../../Sessions/SearchContext/SearchContext'
import CreateSegmentModal from '../../../Sessions/SearchSidebar/SegmentButtons/CreateSegmentModal'
import DeleteSessionSegmentModal from '../../../Sessions/SearchSidebar/SegmentPicker/DeleteSessionSegmentModal/DeleteSessionSegmentModal'
import { STARRED_SEGMENT_ID } from '../../../Sessions/SearchSidebar/SegmentPicker/SegmentPicker'
import styles from './SegmentPickerForPlayer.module.scss'

const SegmentPickerForPlayer = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const {
		setSearchParams,
		setExistingParams,
		searchParams,
		existingParams,
		setShowStarredSessions,
		selectedSegment,
		setSelectedSegment,
		removeSelectedSegment,
	} = useSearchContext()
	const { loading, data } = useGetSegmentsQuery({
		variables: { project_id },
	})
	const [paramsIsDifferent, setParamsIsDifferent] = useState(false)
	const [showCreateSegmentModal, setShowCreateSegmentModal] = useState(false)
	const [segmentToDelete, setSegmentToDelete] = useState<{
		name?: string
		id?: string
	} | null>(null)
	const [editSegment] = useEditSegmentMutation({
		refetchQueries: [namedOperations.Query.GetSegments],
	})

	const segmentOptions = useMemo(
		() => [
			{
				id: STARRED_SEGMENT_ID,
				value: 'Starred',
				params: {
					...EmptySessionsSearchParams,
					query: JSON.stringify({
						isAnd: true,
						rules: [['custom_starred', 'is', 'true']],
					}),
				},
			},
			...(data?.segments || [])
				.map((segment) => ({
					...segment,
					value: segment?.name || '',
				}))
				.sort((a, b) =>
					a.value.toLowerCase() > b.value.toLowerCase() ? 1 : -1,
				),
		],
		[data?.segments],
	)

	const currentSegment = useMemo(
		() => segmentOptions.find((s) => s?.id === selectedSegment?.id),
		[segmentOptions, selectedSegment?.id],
	)

	useEffect(() => {
		if (!loading && currentSegment) {
			const segmentParameters = gqlSanitize({
				...currentSegment?.params,
			})
			if (!segmentParameters.query) {
				segmentParameters.query = JSON.stringify(
					getQueryFromParams(segmentParameters),
				)
			}
			setExistingParams(segmentParameters)
			setSearchParams(segmentParameters)
		}
	}, [currentSegment, loading, setExistingParams, setSearchParams])

	useEffect(() => {
		// Compares original params and current search params to check if they are different
		// Removes undefined, null fields, and empty arrays when comparing
		setParamsIsDifferent(
			!_.isEqual(
				_.omitBy(
					_.pickBy(searchParams, _.identity),
					(v) => Array.isArray(v) && v.length === 0,
				),
				_.omitBy(
					_.pickBy(existingParams, _.identity),
					(v) => Array.isArray(v) && v.length === 0,
				),
			),
		)
	}, [searchParams, existingParams])

	const showUpdateSegmentOption = paramsIsDifferent && currentSegment
	return (
		<section className={styles.segmentPickerSection}>
			<Select
				dropdownMatchSelectWidth={410}
				value={currentSegment?.value}
				onChange={(name, option) => {
					if ((option as any)?.key === STARRED_SEGMENT_ID) {
						setShowStarredSessions(true)
						const searchParams = {
							...EmptySessionsSearchParams,
							query: JSON.stringify({
								isAnd: true,
								rules: [['custom_starred', 'is', 'true']],
							}),
						}
						setExistingParams(searchParams)
						setSearchParams(searchParams)
						setSelectedSegment({
							name,
							id: STARRED_SEGMENT_ID,
						})
						return
					} else {
						setShowStarredSessions(false)
					}

					let nextValue = undefined
					if (name && option) {
						nextValue = {
							name,
							id: (option as any).key,
						}
					} else {
						setExistingParams(EmptySessionsSearchParams)
						setSearchParams(EmptySessionsSearchParams)
						removeSelectedSegment()
					}
					setSelectedSegment(nextValue)
				}}
				className={styles.segmentSelect}
				placeholder="Choose Segment"
				allowClear
				loading={loading}
				optionLabelProp="label"
				notFoundContent={
					<p>
						You haven't created any segments yet. Segments allow you
						to quickly view sessions that match a search query.
					</p>
				}
			>
				{segmentOptions.map((option) => (
					<Option
						value={option.value}
						label={option.value}
						key={option.id}
						className={styles.segmentOption}
					>
						<span className={styles.segmentOptionContainer}>
							<Tooltip title={option.value} placement="topLeft">
								{option.value}
							</Tooltip>
							{option.id !== STARRED_SEGMENT_ID && (
								<Button
									trackingId="deleteSegmentFromPlayerSegmentPicker"
									type="ghost"
									iconButton
									aria-label={`Delete ${option.value} segment`}
									small
									onClick={(e) => {
										e.stopPropagation()
										setSegmentToDelete({
											id: option.id,
											name: option.value,
										})
									}}
								>
									<SvgXIcon />
								</Button>
							)}
						</span>
					</Option>
				))}
			</Select>

			{selectedSegment?.id !== STARRED_SEGMENT_ID && (
				<>
					<Button
						trackingId="CreateSessionSegment"
						onClick={() => {
							if (showUpdateSegmentOption && selectedSegment) {
								editSegment({
									variables: {
										project_id,
										id: selectedSegment.id,
										params: searchParams,
									},
								})
									.then(() => {
										message.success(
											`Updated '${selectedSegment.name}'`,
											5,
										)
										setExistingParams(searchParams)
									})
									.catch(() => {
										message.error(
											'Error updating segment!',
											5,
										)
									})
							} else {
								setShowCreateSegmentModal(true)
							}
						}}
						type="ghost"
						small
						className={classNames(
							styles.segmentButton,
							styles.createOrUpdateButton,
						)}
					>
						{showUpdateSegmentOption ? (
							<SvgEditIcon />
						) : (
							<SvgPlusIcon />
						)}
						<span>
							<TextTransition
								text={
									showUpdateSegmentOption
										? 'Update'
										: 'Create'
								}
								inline
							/>{' '}
							Segment
						</span>
					</Button>
					{showUpdateSegmentOption && (
						<Button
							trackingId="CreateSessionSegment"
							onClick={() => {
								setShowCreateSegmentModal(true)
							}}
							type="ghost"
							small
							className={classNames(styles.segmentButton)}
						>
							<SvgPlusIcon />
						</Button>
					)}
				</>
			)}
			<CreateSegmentModal
				showModal={showCreateSegmentModal}
				onHideModal={() => {
					setShowCreateSegmentModal(false)
				}}
				afterCreateHandler={(segmentId, segmentName) => {
					if (data?.segments) {
						setSelectedSegment({
							id: segmentId,
							name: segmentName,
						})
					}
				}}
			/>
			<DeleteSessionSegmentModal
				showModal={!!segmentToDelete}
				hideModalHandler={() => {
					setSegmentToDelete(null)
				}}
				segmentToDelete={segmentToDelete}
				afterDeleteHandler={() => {
					if (
						segmentToDelete &&
						currentSegment?.value === segmentToDelete.name
					) {
						setSelectedSegment(undefined)
						setSearchParams(EmptySessionsSearchParams)
						removeSelectedSegment()
					}
				}}
			/>
		</section>
	)
}

export default SegmentPickerForPlayer
