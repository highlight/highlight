import { Button } from '@components/Button'
import {
	Box,
	ButtonIcon,
	IconSolidCheveronLeft,
	IconSolidCheveronRight,
	IconSolidDotsHorizontal,
} from '@highlight-run/ui/components'
import { clamp, range } from '@util/numbers'
import React, { useEffect, useMemo } from 'react'

import * as style from './style.css'

export const PAGE_SIZE = 10
export const DEFAULT_SIBLING_COUNT = 2
export const START_PAGE = 1

const OPENSEARCH_MAX_RESULTS = 10000
const MAX_PAGES = Math.floor(OPENSEARCH_MAX_RESULTS / PAGE_SIZE) - 1

type SetPageType = (newPage: number) => void

interface Props {
	page?: number
	setPage: SetPageType | React.Dispatch<React.SetStateAction<number>>
	totalCount: number
	pageSize?: number
	siblingCount?: number
	loading?: boolean
}

enum ExpandAction {
	Back = 'Back',
	Forward = 'Forward',
}

const SearchPagination = ({
	page,
	setPage,
	totalCount,
	pageSize,
	siblingCount,
	loading,
}: Props) => {
	const currentPage = page ?? START_PAGE
	const $pageSize = pageSize ?? PAGE_SIZE
	const $siblingCount = siblingCount ?? DEFAULT_SIBLING_COUNT

	const [resultCount, setResultCount] = React.useState(totalCount)

	useEffect(() => {
		if (!loading) {
			setResultCount(totalCount)
		}
	}, [totalCount, loading])

	const pageCount = Math.min(MAX_PAGES, Math.ceil(resultCount / $pageSize))

	const skip = (offset: number) => {
		const newPage = clamp(
			(page || START_PAGE) + offset,
			START_PAGE,
			pageCount,
		)
		return setPage(newPage)
	}

	// startIdx | dots | siblings | currentIdx | siblings | dots | endIdx
	const sideItemCount = 1 + $siblingCount + 1 + $siblingCount

	const content = useMemo(() => {
		// startIdx | dots | siblings | currentIdx | siblings | dots | endIdx
		const totalItemCount = 2 + $siblingCount + 1 + $siblingCount + 2
		if (pageCount <= totalItemCount) {
			return range(START_PAGE, pageCount + 1)
		}

		const leftmostSiblingPage = Math.max(
			currentPage - $siblingCount,
			START_PAGE,
		)
		const rightmostSiblingPage = Math.min(
			currentPage + $siblingCount,
			START_PAGE + pageCount - 1,
		)

		const showLeftDots = leftmostSiblingPage > START_PAGE + 1
		const showRightDots = rightmostSiblingPage < START_PAGE + pageCount - 2

		if (showLeftDots && showRightDots) {
			const middleRange = range(
				leftmostSiblingPage,
				rightmostSiblingPage + 1,
			)
			return [
				START_PAGE,
				ExpandAction.Back,
				...middleRange,
				ExpandAction.Forward,
				pageCount,
			]
		}

		if (!showLeftDots && showRightDots) {
			const leftRange = range(START_PAGE, sideItemCount)

			return [...leftRange, ExpandAction.Forward, pageCount]
		}

		const rightRange = range(pageCount - sideItemCount + 1, pageCount + 1)
		return [START_PAGE, ExpandAction.Back, ...rightRange]
	}, [$siblingCount, currentPage, sideItemCount, pageCount])

	if (!pageCount) return null

	return (
		<Box
			display="flex"
			justifyContent="space-between"
			gap="8"
			borderTop="secondary"
			px="16"
			pt="8"
			pb="12"
			width="full"
		>
			<ButtonIcon
				kind="secondary"
				shape="thin"
				emphasis="low"
				size="small"
				disabled={currentPage <= START_PAGE}
				onClick={() => {
					skip(-1)
				}}
				icon={<IconSolidCheveronLeft size={14} />}
			/>
			<Box
				display="flex"
				border="secondary"
				borderRadius="6"
				overflow="hidden"
			>
				{content.map((val, idx) => {
					const dotSkip = sideItemCount - 1
					switch (val) {
						case ExpandAction.Forward:
						case ExpandAction.Back:
							return (
								<ButtonIcon
									kind="secondary"
									size="small"
									shape="thin"
									emphasis="low"
									icon={<IconSolidDotsHorizontal size={14} />}
									cssClass={[style.simple, style.rightBorder]}
									key={idx}
									onClick={() =>
										val === ExpandAction.Forward
											? skip(dotSkip)
											: skip(-dotSkip)
									}
								/>
							)
						default:
							return (
								<Button
									cssClass={[
										style.simple,
										{
											[style.selected]:
												val === currentPage,
											[style.rightBorder]:
												idx !== content.length - 1,
										},
									]}
									key={idx}
									onClick={() => setPage(val)}
									size="small"
									emphasis="low"
									kind="secondary"
									trackingId="searchPagination"
								>
									{val}
								</Button>
							)
					}
				})}
			</Box>
			<ButtonIcon
				kind="secondary"
				shape="thin"
				emphasis="low"
				size="small"
				disabled={currentPage >= pageCount}
				onClick={() => {
					skip(1)
				}}
				icon={<IconSolidCheveronRight size={14} />}
			/>
		</Box>
	)
}

export default SearchPagination
