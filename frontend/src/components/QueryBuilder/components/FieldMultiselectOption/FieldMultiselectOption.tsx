import { components } from 'react-select'

const FieldMultiselectOption = (props: any) => {
	const {
		label,
		value,
		isSelected,
		selectOption,
		data: { __isNew__: isNew },
		selectProps: { inputValue },
	} = props

	return (
		<div>
			<components.Option {...props}>
				<div className={styles.optionLabelContainer}>
					<Checkbox
						className={styles.optionCheckbox}
						checked={isSelected}
						onChange={() => {
							selectOption({
								label: label,
								value: value,
								data: { fromCheckbox: true },
							})
						}}
					></Checkbox>

					<OptionLabelName>
						{isNew ? ( // Don't highlight user provided values (e.g. contains/matches input)
							label
						) : (
							<ScrolledTextHighlighter
								searchWords={inputValue.split(' ')}
								textToHighlight={label}
							/>
						)}
					</OptionLabelName>
				</div>
			</components.Option>
		</div>
	)
}

export default FieldMultiselectOption
