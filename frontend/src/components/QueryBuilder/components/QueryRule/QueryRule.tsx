import QueryRuleSelect from '@components/QueryBuilder/components/QueryRuleSelect/QueryRuleSelect'
import { Rule } from '@components/QueryBuilder/rule'
import { Box } from '@highlight-run/ui'

interface Props {
	rule: Rule
	readonly?: boolean
}

const QueryRule = ({ rule, readonly }: Props) => {
	return (
		<Box>
			<QueryRuleSelect
				value={rule.field}
				onChange={onChangeKey}
				loadOptions={getKeyOptions}
				type="select"
				disabled={readonly}
			/>
			<QueryRuleSelect
				value={getOperator(rule.op, rule.val)}
				onChange={onChangeOperator}
				loadOptions={getOperatorOptions}
				type="select"
				disabled={readonly}
			/>
			{!!rule.op && hasArguments(rule.op) && (
				<QueryRuleSelect
					value={rule.val}
					onChange={onChangeValue}
					loadOptions={getValueOptions}
					type={getPopoutType(rule.op)}
					disabled={readonly}
				/>
			)}
			{!readonly && (
				<Button
					trackingId="SessionsQueryRemoveRule"
					className={classNames(styles.ruleItem, styles.removeRule)}
					onClick={() => {
						onRemove()
					}}
				>
					<SvgXIcon />
				</Button>
			)}
		</Box>
	)
}

export default QueryRule
