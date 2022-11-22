import { BaseSearchContext } from '@context/BaseSearchContext'
import { ErrorSearchParamsInput, SearchParamsInput } from '@graph/schemas'
import {
	Box,
	Button,
	ButtonIcon,
	IconPlusSm,
	IconSave,
	IconSegment,
	Text,
} from '@highlight-run/ui'
import { useMemo, useState } from 'react'

enum QueryBuilderState {
	EMPTY = 'EMPTY',
	CUSTOM = 'CUSTOM',
	SEGMENT = 'SEGMENT',
	SEGMENT_UPDATE = 'SEGMENT_UPDATE',
}

export interface QueryBuilderProps<T> {
	searchContext: BaseSearchContext<T>
	readonly?: boolean
}

type SearchContextTypes = SearchParamsInput | ErrorSearchParamsInput

function QueryBuilder<T extends SearchContextTypes>({
	searchContext,
	readonly,
}: QueryBuilderProps<T>) {
	const [builderState, setBuilderState] = useState<QueryBuilderState>(
		QueryBuilderState.EMPTY,
	)
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
		}
	}, [builderState])

	const filterSection = useMemo(() => {
		switch (builderState) {
			case QueryBuilderState.EMPTY:
				return null
			default:
				return (
					<Box
						p="4"
						paddingBottom="8"
						background="white"
						borderBottom="neutral"
					>
						test
					</Box>
				)
		}
	}, [builderState])

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
