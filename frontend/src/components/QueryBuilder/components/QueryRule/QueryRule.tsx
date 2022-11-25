import QueryRuleSelect, {
	LoadOptions,
	OnChange,
	pickQueryRuleSelectType,
	QueryRuleSelectType,
} from '@components/QueryBuilder/components/QueryRuleSelect/QueryRuleSelect'
import { OptionKind } from '@components/QueryBuilder/field'
import { OperatorName } from '@components/QueryBuilder/operator'
import { Rule } from '@components/QueryBuilder/rule'
import { Box, Button, IconXCircle } from '@highlight-run/ui'

interface Props {
	rule: Rule
	readonly?: boolean
	onChangeKey: OnChange
	getKeyOptions: LoadOptions
	onChangeOperator: OnChange
	getOperatorOptions: LoadOptions
	onChangeValue: OnChange
	getValueOptions: LoadOptions
	onRemove: () => void
}

const QueryRule = ({
	rule,
	readonly,
	onChangeKey,
	getKeyOptions,
	onChangeOperator,
	getOperatorOptions,
	onChangeValue,
	getValueOptions,
	onRemove,
}: Props) => {
	return (
		<Box>
			<QueryRuleSelect
				value={rule.field}
				onChange={onChangeKey}
				loadOptions={getKeyOptions}
				type={QueryRuleSelectType.SINGLE}
				disabled={readonly}
			/>
			<QueryRuleSelect
				value={{
					kind: OptionKind.SINGLE,
					value: JSON.stringify(rule.op),
					label: rule.operatorLabel,
				}}
				onChange={onChangeOperator}
				loadOptions={getOperatorOptions}
				type={QueryRuleSelectType.SINGLE}
				disabled={readonly}
			/>
			{!!rule.op && rule.op.name !== OperatorName.EXISTS && (
				<QueryRuleSelect
					value={rule.val}
					onChange={onChangeValue}
					loadOptions={getValueOptions}
					type={pickQueryRuleSelectType(rule.op)}
					disabled={readonly}
				/>
			)}
			{!readonly && (
				<Button
					// className={c(styles.ruleItem, styles.removeRule)}
					onClick={() => {
						onRemove()
					}}
				>
					<IconXCircle />
				</Button>
			)}
		</Box>
	)
}

export default QueryRule
