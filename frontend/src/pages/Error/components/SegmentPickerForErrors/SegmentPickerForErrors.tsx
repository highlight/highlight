import { namedOperations } from '@graph/operations'
import SvgXIcon from '@icons/XIcon'
import { message, Select as AntDesignSelect } from 'antd'
import classNames from 'classnames'
const { Option } = AntDesignSelect
import { getQueryFromParams } from '@pages/Error/components/ErrorQueryBuilder/ErrorQueryBuilder'
import { useParams } from '@util/react-router/useParams'
import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import TextTransition from 'react-text-transition'

import Button from '../../../../components/Button/Button/Button'
import Select from '../../../../components/Select/Select'
import Tooltip from '../../../../components/Tooltip/Tooltip'
import {
	useEditErrorSegmentMutation,
	useGetErrorSegmentsQuery,
} from '../../../../graph/generated/hooks'
import SvgEditIcon from '../../../../static/EditIcon'
import SvgPlusIcon from '../../../../static/PlusIcon'
import { gqlSanitize } from '../../../../util/gqlSanitize'
import { useErrorSearchContext } from '../../../Errors/ErrorSearchContext/ErrorSearchContext'
import CreateErrorSegmentModal from '../../../Errors/ErrorSegmentSidebar/SegmentButtons/CreateErrorSegmentModal'
import DeleteErrorSegmentModal from '../../../Errors/ErrorSegmentSidebar/SegmentPicker/DeleteErrorSegmentModal/DeleteErrorSegmentModal'
import { EmptyErrorsSearchParams } from '../../../Errors/ErrorsPage'
import styles from './SegmentPickerForErrors.module.scss'

const SegmentPickerForErrors = () => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const {
		setSearchParams,
		setSegmentName,
		setExistingParams,
		segmentName,
		searchParams,
		existingParams,
		selectedSegment,
		setSelectedSegment,
	} = useErrorSearchContext()
	const { loading, data } = useGetErrorSegmentsQuery({
		variables: { project_id },
	})
	const [paramsIsDifferent, setParamsIsDifferent] = useState(false)
	const [showCreateSegmentModal, setShowCreateSegmentModal] = useState(false)
	const [segmentToDelete, setSegmentToDelete] = useState<{
		name?: string
		id?: string
	} | null>(null)
	const [editSegment] = useEditErrorSegmentMutation({
		refetchQueries: [namedOperations.Query.GetErrorSegments],
	})

	const currentSegment = data?.error_segments?.find(
		(s) => s?.id === selectedSegment?.id,
	)

	useEffect(() => {
		if (currentSegment) {
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
			setSegmentName(currentSegment?.name || null)
		}
	}, [currentSegment, setExistingParams, setSearchParams, setSegmentName])

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

	const showUpdateSegmentOption = paramsIsDifferent && segmentName
	const segmentOptions = (data?.error_segments || [])
		.map((segment) => ({
			displayValue: segment?.name || '',
			value: segment?.name || '',
			id: segment?.id || '',
		}))
		.sort((a, b) =>
			a.displayValue.toLowerCase() > b.displayValue.toLowerCase()
				? 1
				: -1,
		)
	return (
		<section className={styles.segmentPickerSection}>
			<Select
				value={segmentName}
				onChange={(name, option) => {
					let nextValue = undefined
					if (name && option) {
						nextValue = {
							name,
							id: (option as any).key,
						}
					} else {
						setExistingParams(EmptyErrorsSearchParams)
						setSearchParams(EmptyErrorsSearchParams)
						setSegmentName(null)
					}
					setSelectedSegment(nextValue)
				}}
				className={styles.segmentSelect}
				placeholder="Choose Segment"
				dropdownMatchSelectWidth={410}
				allowClear
				loading={loading}
				hasAccent
				optionLabelProp="label"
				notFoundContent={
					<p>
						You haven't created any segments yet. Segments allow you
						to quickly view errors that match a search query.
					</p>
				}
			>
				{segmentOptions.map((option) => (
					<Option
						value={option.value}
						label={option.displayValue}
						key={option.id}
						className={styles.segmentOption}
					>
						<span className={styles.segmentOptionContainer}>
							<Tooltip
								title={option.displayValue}
								placement="topLeft"
							>
								{option.displayValue}
							</Tooltip>
							<Button
								trackingId="deleteSegmentFromErrorSegmentPicker"
								type="ghost"
								iconButton
								aria-label={`Delete ${option.value} segment`}
								small
								onClick={(e) => {
									e.stopPropagation()
									setSegmentToDelete({
										id: option.id,
										name: option.displayValue,
									})
								}}
							>
								<SvgXIcon />
							</Button>
						</span>
					</Option>
				))}
			</Select>

			<Button
				trackingId="CreateErrorSegment"
				onClick={() => {
					if (showUpdateSegmentOption && selectedSegment) {
						const { ...restOfSearchParams } = searchParams
						editSegment({
							variables: {
								project_id,
								id: selectedSegment.id,
								params: restOfSearchParams,
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
								message.error('Error updating segment!', 5)
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
				{showUpdateSegmentOption ? <SvgEditIcon /> : <SvgPlusIcon />}
				<span>
					<TextTransition
						text={showUpdateSegmentOption ? 'Update' : 'Create'}
						inline
					/>{' '}
					Segment
				</span>
			</Button>
			<CreateErrorSegmentModal
				showModal={showCreateSegmentModal}
				onHideModal={() => {
					setShowCreateSegmentModal(false)
				}}
				afterCreateHandler={(segmentId, segmentName) => {
					if (data?.error_segments) {
						setSelectedSegment({
							id: segmentId,
							name: segmentName,
						})
						setSegmentName(segmentName)
					}
				}}
			/>
			<DeleteErrorSegmentModal
				showModal={!!segmentToDelete}
				hideModalHandler={() => {
					setSegmentToDelete(null)
				}}
				segmentToDelete={segmentToDelete}
				afterDeleteHandler={() => {
					if (
						segmentToDelete &&
						segmentName === segmentToDelete.name
					) {
						setSelectedSegment(undefined)
						setSegmentName(null)
						setSearchParams(EmptyErrorsSearchParams)
					}
				}}
			/>
		</section>
	)
}

export default SegmentPickerForErrors
