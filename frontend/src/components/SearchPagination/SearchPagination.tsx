import {
	Box,
	Button,
	ButtonIcon,
	IconChevronLeft,
	IconChevronRight,
	IconDotsHorizontal,
} from '@highlight-run/ui'
import { clamp, range } from '@util/numbers'
import React, { useMemo } from 'react'

import * as style from './style.css'

export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_SIBLING_COUNT = 2
export const START_PAGE = 1

const OPENSEARCH_MAX_RESULTS = 10000
const MAX_PAGES = Math.floor(OPENSEARCH_MAX_RESULTS / DEFAULT_PAGE_SIZE) - 1

interface Props {
	page?: number
	setPage: React.Dispatch<React.SetStateAction<number | undefined>>
	totalCount: number
	pageSize?: number
	siblingCount?: number
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
}: Props) => {
	const currentPage = page ?? START_PAGE
	const $pageSize = pageSize ?? DEFAULT_PAGE_SIZE
	const $siblingCount = siblingCount ?? DEFAULT_SIBLING_COUNT

	const totalPageCount = Math.ceil(totalCount / $pageSize)
	const maxPage = Math.min(MAX_PAGES, totalPageCount)
	const skip = (offset: number) => {
		return setPage((p) =>
			clamp((p || START_PAGE) + offset, START_PAGE, maxPage),
		)
	}

	// startIdx | dots | siblings | currentIdx | siblings | dots | endIdx
	const sideItemCount = 1 + $siblingCount + 1 + $siblingCount

	const content = useMemo(() => {
		// startIdx | dots | siblings | currentIdx | siblings | dots | endIdx
		const totalItemCount = 2 + $siblingCount + 1 + $siblingCount + 2
		if (totalPageCount <= totalItemCount) {
			return range(START_PAGE, totalPageCount)
		}

		const leftmostSiblingPage = Math.max(
			currentPage - $siblingCount,
			START_PAGE,
		)
		const rightmostSiblingPage = Math.min(
			currentPage + $siblingCount,
			START_PAGE + totalPageCount - 1,
		)

		const showLeftDots = leftmostSiblingPage > START_PAGE + 1
		const showRightDots =
			rightmostSiblingPage < START_PAGE + totalPageCount - 2

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
				totalPageCount,
			]
		}

		if (!showLeftDots && showRightDots) {
			const leftRange = range(START_PAGE, sideItemCount)

			return [...leftRange, ExpandAction.Forward, totalPageCount]
		}

		const rightRange = range(
			totalPageCount - sideItemCount + 1,
			totalPageCount + 1,
		)
		return [START_PAGE, ExpandAction.Back, ...rightRange]
	}, [$siblingCount, currentPage, sideItemCount, totalPageCount])

	if (!maxPage) return null

	return (
		<Box
			display="flex"
			justifyContent="space-between"
			gap="8"
			borderTop="neutral"
			px="16"
			pt="8"
			pb="12"
		>
			<ButtonIcon
				kind="secondary"
				shape="thin"
				disabled={currentPage <= START_PAGE}
				onClick={() => {
					skip(-1)
				}}
				icon={<IconChevronLeft size={14} />}
			/>
			<Box
				display="flex"
				border="neutral"
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
									emphasis="medium"
									icon={<IconDotsHorizontal size={14} />}
									cssClass={style.simple}
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
										},
									]}
									key={idx}
									onClick={() => setPage(val)}
									size="small"
									emphasis="medium"
									kind="secondary"
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
				disabled={currentPage >= maxPage}
				onClick={() => {
					skip(1)
				}}
				icon={<IconChevronRight size={14} />}
			/>
		</Box>
	)
}

export default SearchPagination
