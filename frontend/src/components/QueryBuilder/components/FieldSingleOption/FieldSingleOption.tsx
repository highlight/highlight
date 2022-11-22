import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import {
	CustomFieldType,
	Field,
	getFieldDisplayName,
	getFieldType,
	getFieldTypeDisplayName,
} from '@components/QueryBuilder/field'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { useMemo } from 'react'
import { components, OptionProps } from 'react-select'

type Props = OptionProps<Field, false>

const DEFAULT_TOOLTIP_MESSAGE =
	'This property was automatically collected by Highlight'

const TOOLTIP_MESSAGES: { [K in string]: string } = {
	contains: 'Filters for results that contain the input term(s).',
	not_contains: 'Filters for results that do not contain the input term(s).',
	matches:
		'Filters for results which match the input regex(es). Uses Lucene regex syntax.',
	not_matches:
		'Filters for results which do not match the input regex(es). Uses Lucene regex syntax.',
	exists: 'Filters for results which have this field.',
	not_exists: 'Filters for results which do not have this field.',
} as const

const FieldSingleOption = (props: Props) => {
	const {
		selectProps: { inputValue },
		getValue,
	} = props
	const { value } = getValue()[0]
	const field = { label: props.label, value }
	const type = getFieldType(field)
	const typeLabel = getFieldTypeDisplayName(type)
	const nameLabel = getFieldDisplayName(field)
	const searchWords = [inputValue || '']
	const tooltipMessage = TOOLTIP_MESSAGES[value]

	const tooltipInfo = useMemo(() => {
		if (
			!!tooltipMessage ||
			Object.values(CustomFieldType).includes(type as CustomFieldType) ||
			field.value === 'user_identifier'
		) {
			return (
				<InfoTooltip
					title={tooltipMessage ?? DEFAULT_TOOLTIP_MESSAGE}
					size="medium"
					hideArrow
					placement="right"
					// className={styles.optionTooltip}
				/>
			)
		}
	}, [field.value, tooltipMessage, type])

	return (
		<div>
			<components.Option {...props}>
				<div
				// className={styles.optionLabelContainer}
				>
					{!!typeLabel && (
						<div
						// className={styles.labelTypeContainer}
						>
							<div
							// className={styles.optionLabelType}
							>
								<TextHighlighter
									searchWords={searchWords}
									textToHighlight={typeLabel}
								/>
							</div>
						</div>
					)}
					<div
					// className={styles.optionLabelName}
					>
						<TextHighlighter
							searchWords={searchWords}
							textToHighlight={nameLabel}
						/>
					</div>
					{tooltipInfo}
				</div>
			</components.Option>
		</div>
	)
}

export default FieldSingleOption
