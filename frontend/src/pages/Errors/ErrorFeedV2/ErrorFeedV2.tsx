import BarChart from '@components/BarChart/BarChart'
import { Pagination, STARTING_PAGE } from '@components/Pagination/Pagination'
import { SearchEmptyState } from '@components/SearchEmptyState/SearchEmptyState'
import { useGetErrorGroupsOpenSearchQuery } from '@graph/hooks'
import { ErrorGroup, ErrorResults, ErrorState, Maybe } from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import ErrorQueryBuilder from '@pages/Error/components/ErrorQueryBuilder/ErrorQueryBuilder'
import SegmentPickerForErrors from '@pages/Error/components/SegmentPickerForErrors/SegmentPickerForErrors'
import ErrorFeedHistogram from '@pages/ErrorsV2/ErrorFeedHistogram/ErrorFeedHistogram'
import { getErrorBody } from '@util/errors/errorUtils'
import { gqlSanitize } from '@util/gqlSanitize'
import { formatNumber } from '@util/numbers'
import { useParams } from '@util/react-router/useParams'
import classNames from 'classnames/bind'
import React, { useEffect, useRef, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Link } from 'react-router-dom'

import Tooltip from '../../../components/Tooltip/Tooltip'
import { useErrorSearchContext } from '../ErrorSearchContext/ErrorSearchContext'
import styles from './ErrorFeedV2.module.scss'

const PAGE_SIZE = 10

export const ErrorFeedV2 = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const [data, setData] = useState<ErrorResults>({
		error_groups: [],
		totalCount: 0,
	})
	const totalPages = useRef<number>(0)
	const {
		backendSearchQuery,
		page,
		setPage,
		searchResultsLoading,
		setSearchResultsLoading,
	} = useErrorSearchContext()
	const projectHasManyErrors = data.totalCount > PAGE_SIZE

	const [errorFeedIsInTopScrollPosition, setErrorFeedIsInTopScrollPosition] =
		useState(true)
	useEffect(() => {
		if (backendSearchQuery) {
			setSearchResultsLoading(true)
		}
	}, [backendSearchQuery, page, setSearchResultsLoading])

	const { loading } = useGetErrorGroupsOpenSearchQuery({
		variables: {
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
			}
			setSearchResultsLoading(false)
		},
		skip: !backendSearchQuery,
		fetchPolicy: projectHasManyErrors ? 'cache-first' : 'no-cache',
	})

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
			{(loading || data.totalCount > 0) && <ErrorFeedHistogram />}
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
								<SearchEmptyState item="errors" />
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
					<Box style={{ flexShrink: 0, width: 80 }}>
						<BarChart
							data={errorDates}
							minBarHeight={5}
							width={80}
						/>
					</Box>
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
