import { BaseSearchContext } from '@context/BaseSearchContext'
import { ErrorSearchParamsInput, SearchParamsInput } from '@graph/schemas'
import {
	Box,
	Button,
	ButtonIcon,
	IconChevronDown,
	IconPlusSm,
	IconSave,
	IconSegment,
	Tag,
	Text,
} from '@highlight-run/ui'
import { omitBy } from 'lodash'
import identity from 'lodash/identity'
import isEqual from 'lodash/isEqual'
import pickBy from 'lodash/pickBy'
import { useEffect, useMemo, useState } from 'react'

enum QueryBuilderState {
	EMPTY = 'EMPTY',
	CUSTOM = 'CUSTOM',
	SEGMENT = 'SEGMENT',
	SEGMENT_UPDATE = 'SEGMENT_UPDATE',
}

export type QueryBuilderType = 'sessions' | 'errors'
export interface QueryBuilderProps<SearchParams, SegmentData> {
	searchContext: BaseSearchContext<SearchParams>
	readonly?: boolean
}

type SearchContextTypes = SearchParamsInput | ErrorSearchParamsInput

function QueryBuilder<SearchParams extends SearchContextTypes, SegmentData>({
	searchContext,
	readonly,
}: QueryBuilderProps<SearchParams, SegmentData>) {
	const [builderState, setBuilderState] = useState<QueryBuilderState>(
		QueryBuilderState.EMPTY,
	)

	const {
		rules,
		searchParams,
		existingParams,
		segmentName,
		isAnd,
		toggleIsAnd,
	} = searchContext
	const [areParamsDifferent, setAreParamsDifferent] = useState(false)
	useEffect(() => {
		// Compares original params and current search params to check if they are different
		// Removes undefined, null fields, and empty arrays when comparing
		const normalize = (params: SearchContextTypes) =>
			omitBy(
				pickBy(params, identity),
				(val) => Array.isArray(val) && val.length === 0,
			)
		setAreParamsDifferent(
			!isEqual(normalize(searchParams), normalize(existingParams)),
		)
	}, [searchParams, existingParams])

	useEffect(() => {
		if (!!segmentName) {
			if (areParamsDifferent) {
				setBuilderState(QueryBuilderState.SEGMENT_UPDATE)
			} else {
				setBuilderState(QueryBuilderState.SEGMENT)
			}
		}
	}, [areParamsDifferent, segmentName])

	const actionButton = useMemo(() => {
		switch (builderState) {
			case QueryBuilderState.EMPTY:
				return (
					<Button
						kind="secondary"
						size="xSmall"
						emphasis="low"
						iconLeft={<IconPlusSm size={12} />}
						onClick={() => {
							setBuilderState(QueryBuilderState.CUSTOM)
						}}
					>
						Add filter
					</Button>
				)
			case QueryBuilderState.CUSTOM:
				return (
					<Button
						kind="secondary"
						size="xSmall"
						emphasis="medium"
						iconLeft={<IconSave size={12} />}
						onClick={() => {
							setBuilderState(QueryBuilderState.EMPTY)
						}}
					>
						Save
					</Button>
				)
			case QueryBuilderState.SEGMENT:
				return (
					<Button
						kind="secondary"
						size="xSmall"
						emphasis="medium"
						iconLeft={<IconSegment size={12} />}
						iconRight={<IconChevronDown size={12} />}
						onClick={() => {}}
					>
						{segmentName}
					</Button>
				)
			case QueryBuilderState.SEGMENT_UPDATE:
				return (
					<Button
						kind="primary"
						size="xSmall"
						emphasis="high"
						iconLeft={<IconSegment size={12} />}
						iconRight={<IconChevronDown size={12} />}
						onClick={() => {}}
					>
						{segmentName}
					</Button>
				)
		}
	}, [builderState, segmentName])

	const filterSection = useMemo(() => {
		if (builderState === QueryBuilderState.EMPTY) {
			return null
		}

		return (
			<Box
				p="4"
				paddingBottom="8"
				background="white"
				borderBottom="neutral"
			>
				{rules.map((rule, idx) => (
					<>{idx !== 0 && <Tag>{isAnd ? 'and' : 'or'}</Tag>}</>
				))}
			</Box>
		)
	}, [builderState, isAnd, rules])

	return (
		<Box
			border="neutral"
			borderRadius="8"
			display="flex"
			flexDirection="column"
			overflow="hidden"
		>
			{filterSection}
			<Box
				display="flex"
				p="8"
				paddingRight="4"
				justifyContent="space-between"
				alignItems="center"
			>
				<Text
					size="xSmall"
					weight="medium"
					color="neutral300"
					userSelect="none"
				>
					300 results
				</Text>
				<Box display="flex" gap="4">
					{actionButton}
					<ButtonIcon
						kind="secondary"
						size="tiny"
						emphasis="high"
						shape="square"
						icon={<IconSegment size={12} />}
					/>
				</Box>
			</Box>
		</Box>
	)
}

export default QueryBuilder
