import { useAuthContext } from '@authentication/AuthContext'
import BarChart from '@components/BarChart/BarChart'
import { Series } from '@components/Histogram/Histogram'
import { Pagination, STARTING_PAGE } from '@components/Pagination/Pagination'
import { SearchEmptyState } from '@components/SearchEmptyState/SearchEmptyState'
import { SearchResultsHistogram } from '@components/SearchResultsHistogram/SearchResultsHistogram'
import {
	useGetErrorGroupsOpenSearchQuery,
	useGetErrorsHistogramQuery,
} from '@graph/hooks'
import {
	DateHistogramBucketSize,
	ErrorGroup,
	ErrorResults,
	ErrorState,
	Maybe,
} from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { useProjectId } from '@hooks/useProjectId'
import ErrorQueryBuilder, {
	TIME_RANGE_FIELD,
} from '@pages/Error/components/ErrorQueryBuilder/ErrorQueryBuilder'
import SegmentPickerForErrors from '@pages/Error/components/SegmentPickerForErrors/SegmentPickerForErrors'
import { updateQueriedTimeRange } from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/QueryBuilder'
import useLocalStorage from '@rehooks/local-storage'
import { getErrorBody } from '@util/errors/errorUtils'
import { gqlSanitize } from '@util/gqlSanitize'
import { formatNumber } from '@util/numbers'
import { useParams } from '@util/react-router/useParams'
import { serializeAbsoluteTimeRange } from '@util/time'
import classNames from 'classnames/bind'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Link } from 'react-router-dom'

import Tooltip from '../../../components/Tooltip/Tooltip'
import { useErrorSearchContext } from '../ErrorSearchContext/ErrorSearchContext'
import styles from './ErrorFeedV2.module.scss'

const PAGE_SIZE = 10

const useHistogram = (projectID: string, projectHasManyErrors: boolean) => {
	const { backendSearchQuery, searchParams, setSearchParams } =
		useErrorSearchContext()
	const [histogram, setHistogram] = useState<{
		seriesList: Series[]
		bucketTimes: number[]
	}>({
		seriesList: [],
		bucketTimes: [],
	})
	const { loading } = useGetErrorsHistogramQuery({
		variables: {
			query: backendSearchQuery?.childSearchQuery as string,
			project_id: projectID,
			histogram_options: {
				bucket_size:
					backendSearchQuery?.histogramBucketSize as DateHistogramBucketSize,
				time_zone:
					Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
				bounds: {
					start_date:
						backendSearchQuery?.startDate.toISOString() as string,
					end_date:
						backendSearchQuery?.endDate.toISOString() as string,
				},
			},
		},
		onCompleted: (r) => {
			let seriesList: Series[] = []
			let bucketTimes: number[] = []
			const histogramData = r?.errors_histogram
			if (backendSearchQuery && histogramData) {
				bucketTimes = histogramData.bucket_times.map((startTime) =>
					new Date(startTime).valueOf(),
				)
				seriesList = [
					{
						label: 'Errors logged',
						color: colors.neutralN9,
						counts: histogramData.error_objects,
					},
				]
			}
			setHistogram({
				seriesList,
				bucketTimes,
			})
		},
		skip: !backendSearchQuery?.childSearchQuery,
		fetchPolicy: projectHasManyErrors ? 'cache-first' : 'no-cache',
	})

	const updateTimeRange = useCallback(
		(newStartTime: Date, newEndTime: Date) => {
			const newSearchParams = {
				...searchParams,
				query: updateQueriedTimeRange(
					searchParams.query || '',
					TIME_RANGE_FIELD,
					serializeAbsoluteTimeRange(newStartTime, newEndTime),
				),
			}
			setSearchParams(newSearchParams)
		},
		[searchParams, setSearchParams],
	)

	return (
		<Box paddingTop="8">
			<SearchResultsHistogram
				seriesList={histogram.seriesList}
				bucketTimes={histogram.bucketTimes}
				bucketSize={backendSearchQuery?.histogramBucketSize}
				loading={loading}
				updateTimeRange={updateTimeRange}
			/>
		</Box>
	)
}

export const ErrorFeedV2 = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const { isHighlightAdmin } = useAuthContext()
	const [data, setData] = useState<ErrorResults>({
		error_groups: [],
		totalCount: 0,
	})
	const totalPages = useRef<number>(0)
	const [errorsCount, setErrorsCount] = useLocalStorage<number>(
		`errorsCount-project-${project_id}`,
		0,
	)
	const {
		backendSearchQuery,
		page,
		setPage,
		searchResultsLoading,
		setSearchResultsLoading,
	} = useErrorSearchContext()
	const projectHasManyErrors = errorsCount > PAGE_SIZE

	const [errorFeedIsInTopScrollPosition, setErrorFeedIsInTopScrollPosition] =
		useState(true)
	useEffect(() => {
		if (backendSearchQuery) {
			setSearchResultsLoading(true)
		}
	}, [backendSearchQuery, page, setSearchResultsLoading])

	const { loading } = useGetErrorGroupsOpenSearchQuery({
		variables: {
			influx: false,
			query: backendSearchQuery?.searchQuery || '',
			count: PAGE_SIZE,
			page: page && page > 0 ? page : 1,
			project_id,
		},
		onCompleted: (r) => {
			if (r?.error_groups_opensearch) {
				setData(gqlSanitize(r?.error_groups_opensearch))
				totalPages.current = Math.ceil(
					r?.error_groups_opensearch.totalCount / PAGE_SIZE,
				)
				setErrorsCount(r?.error_groups_opensearch.totalCount)
			}
			setSearchResultsLoading(false)
		},
		skip: !backendSearchQuery,
		fetchPolicy: projectHasManyErrors ? 'cache-first' : 'no-cache',
	})
	const histogram = useHistogram(project_id, projectHasManyErrors)

	const onFeedScrollListener = (
		e: React.UIEvent<HTMLElement> | undefined,
	) => {
		setErrorFeedIsInTopScrollPosition(e?.currentTarget.scrollTop === 0)
	}

	return (
		<>
			<div className={styles.filtersContainer}>
				<SegmentPickerForErrors />
				<ErrorQueryBuilder />
			</div>
			{isHighlightAdmin && (loading || data.totalCount > 0) && histogram}
			<div className={styles.fixedContent}>
				<div className={styles.resultCount}>
					{loading ? (
						<Skeleton width="100px" />
					) : (
						`${formatNumber(data.totalCount)} errors`
					)}
				</div>
			</div>
			<div className={styles.feedContent}>
				<div
					className={classNames(styles.feedLine, {
						[styles.hasScrolled]: !errorFeedIsInTopScrollPosition,
					})}
				/>
				<div
					className={classNames(styles.feedItems, {
						[styles.hasScrolled]: !errorFeedIsInTopScrollPosition,
					})}
					onScroll={onFeedScrollListener}
				>
					{searchResultsLoading ? (
						<Skeleton
							height={110}
							count={3}
							style={{
								borderRadius: 8,
								marginBottom: 14,
							}}
						/>
					) : (
						<>
							{!data.error_groups.length ? (
								<SearchEmptyState item={'errors'} />
							) : (
								data.error_groups?.map(
									(u: Maybe<ErrorGroup>, ind: number) => (
										<ErrorCardV2
											errorGroup={u}
											key={ind}
											urlParams={`?page=${
												page || STARTING_PAGE
											}`}
										/>
									),
								)
							)}
						</>
					)}
				</div>
			</div>
			<Pagination
				page={page}
				setPage={setPage}
				totalPages={totalPages.current}
				pageSize={PAGE_SIZE}
			/>
		</>
	)
}

const ErrorCardV2 = ({
	errorGroup,
	urlParams,
}: {
	errorGroup: Maybe<ErrorGroup>
	urlParams?: string
}) => {
	const { projectId } = useProjectId()
	const { error_secure_id } = useParams<{
		error_secure_id?: string
	}>()

	// Represents the last six days i.e. [5 days ago, 4 days ago, 3 days ago, etc..]
	const [errorDates, setErrorDates] = useState<Array<number>>(
		Array(6).fill(0),
	)

	useEffect(() => {
		if (errorGroup?.error_frequency.length)
			setErrorDates(errorGroup.error_frequency)
	}, [setErrorDates, errorGroup])

	return (
		<div className={styles.errorCardWrapper} key={errorGroup?.secure_id}>
			<Link
				to={`/${projectId}/errors/${errorGroup?.secure_id}${
					urlParams || ''
				}`}
			>
				<div
					className={classNames(styles.errorCard, {
						[styles.selected]:
							error_secure_id === errorGroup?.secure_id,
					})}
				>
					<BarChart data={errorDates} minBarHeight={5} />
					<div className={styles.errorTextSectionWrapper}>
						<div
							className={styles.errorTextSection}
							style={{ width: '240px' }}
						>
							<div className={styles.topText} dir="rtl">
								{
									errorGroup?.structured_stack_trace[0]
										?.fileName
								}
							</div>
							<div
								className={classNames(
									styles.middleText,
									'highlight-block',
								)}
							>
								{getErrorBody(errorGroup?.event)}
							</div>
						</div>
						<div className={styles.errorTextSection}>
							{errorGroup?.created_at ? (
								<>
									<div className={styles.bottomText}>
										{`Since ${new Date(
											errorGroup.created_at,
										).toLocaleString('en-us', {
											day: 'numeric',
											month: 'long',
											year: 'numeric',
										})}`}
									</div>
								</>
							) : (
								<></>
							)}
						</div>
						<div className={styles.readMarkerContainer}>
							<Tooltip
								title={`This error is ${errorGroup?.state?.toLowerCase()}.`}
							>
								<div
									className={classNames(
										styles.readMarker,
										// @ts-ignore
										styles[
											errorGroup?.state.toLowerCase() ||
												ErrorState.Open.toLowerCase()
										],
									)}
								/>
							</Tooltip>
						</div>
					</div>
				</div>
			</Link>
		</div>
	)
}
