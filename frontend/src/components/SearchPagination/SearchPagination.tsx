import {
	Box,
	ButtonIcon,
	IconChevronLeft,
	IconChevronRight,
} from '@highlight-run/ui'
import React from 'react'

export const DEFAULT_PAGE_SIZE = 10
export const STARTING_PAGE = 1

const OPENSEARCH_MAX_RESULTS = 10000
const MAX_PAGES = Math.floor(OPENSEARCH_MAX_RESULTS / DEFAULT_PAGE_SIZE) - 1

enum PageDirection {
	Forward,
	Backward,
}

interface Props {
	page?: number
	setPage: React.Dispatch<React.SetStateAction<number | undefined>>
	totalPages: number
	pageSize?: number
}

const SearchPagination = ({ page, setPage, totalPages, pageSize }: Props) => {
	if (!pageSize) {
		pageSize = DEFAULT_PAGE_SIZE
	}

	const maxPage = Math.min(MAX_PAGES, totalPages)
	const changePage = (dir: PageDirection) => {
		if (dir === PageDirection.Forward) {
			if ((page || STARTING_PAGE) < maxPage) {
				setPage((p) => (p || STARTING_PAGE) + 1)
			}
		} else if (dir === PageDirection.Backward) {
			if ((page || STARTING_PAGE) > STARTING_PAGE) {
				setPage((p) => (p || STARTING_PAGE) - 1)
			}
		}
	}
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
				variant="secondary"
				shape="thin"
				disabled={(page || STARTING_PAGE) <= STARTING_PAGE}
				onClick={() => {
					changePage(PageDirection.Backward)
				}}
				icon={<IconChevronLeft size={14} />}
			/>
			<ButtonIcon
				variant="secondary"
				shape="thin"
				disabled={(page || STARTING_PAGE) >= maxPage}
				onClick={() => {
					changePage(PageDirection.Forward)
				}}
				icon={<IconChevronRight size={14} />}
			/>
		</Box>
	)
}

export default SearchPagination
