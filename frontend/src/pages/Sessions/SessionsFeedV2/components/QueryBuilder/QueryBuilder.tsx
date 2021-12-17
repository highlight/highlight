import Button from '@components/Button/Button/Button';
import Popover from '@components/Popover/Popover';
import { Field } from '@graph/schemas';
import SvgXIcon from '@icons/XIcon';
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext';
import { SharedSelectStyleProps } from '@pages/Sessions/SearchInputs/SearchInputUtil';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { OptionTypeBase } from 'react-select/src/types';
import { useToggle } from 'react-use';

import {
    useGetAppVersionsQuery,
    useGetFieldsOpensearchQuery,
    useGetFieldTypesQuery,
} from '../../../../../graph/generated/hooks';
import styles from './QueryBuilder.module.scss';

interface RuleProps {
    field: SelectOption | undefined;
    op: string | undefined;
    val: MultiselectOption | undefined;
}

interface SelectOption {
    kind: 'single';
    label: string;
    value: string;
}
interface MultiselectOption {
    kind: 'multi';
    options: readonly {
        label: string;
        value: string;
    }[];
}

type OnChangeInput = SelectOption | MultiselectOption | undefined;
type OnChange = (val: OnChangeInput) => void;
type LoadOptions = (input: string, callback: any) => Promise<any>;

interface RuleFuncs {
    onChangeKey: OnChange;
    getKeyOptions: LoadOptions;
    onChangeOperator: OnChange;
    getOperatorOptions: LoadOptions;
    onChangeValue: OnChange;
    getValueOptions: LoadOptions;
    onRemove: () => void;
}

type PopoutType = 'select' | 'multiselect' | 'creatable';
interface PopoutProps {
    type: PopoutType;
    value: OnChangeInput;
    onChange: OnChange;
    loadOptions: LoadOptions;
}

interface SetVisible {
    setVisible: (val: boolean) => void;
}

const PopoutContent = ({
    value,
    onChange,
    loadOptions,
    setVisible,
    type,
    ...props
}: PopoutProps & SetVisible & OptionTypeBase) => {
    switch (type) {
        case 'select':
            return (
                <AsyncSelect
                    autoFocus
                    openMenuOnFocus
                    value={value?.kind === 'single' ? value : null}
                    styles={SharedSelectStyleProps}
                    loadOptions={loadOptions}
                    defaultOptions
                    components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                    }}
                    onChange={(item) => {
                        onChange(
                            !!item ? { kind: 'single', ...item } : undefined
                        );
                        setVisible(false);
                    }}
                    onBlur={() => setVisible(false)}
                    {...props}
                />
            );
        case 'multiselect':
            return (
                <AsyncSelect
                    autoFocus
                    openMenuOnFocus
                    isMulti
                    value={value?.kind === 'multi' ? value.options : null}
                    styles={SharedSelectStyleProps}
                    loadOptions={loadOptions}
                    defaultOptions
                    components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                    }}
                    onChange={(item) => {
                        onChange(
                            !!item
                                ? {
                                      kind: 'multi',
                                      options: item as readonly {
                                          label: string;
                                          value: string;
                                      }[],
                                  }
                                : undefined
                        );
                        if (value === undefined) {
                            setVisible(false);
                        }
                    }}
                    onBlur={() => setVisible(false)}
                    {...props}
                />
            );
        case 'creatable':
            return (
                <AsyncCreatableSelect
                    autoFocus
                    openMenuOnFocus
                    isMulti
                    value={value?.kind === 'multi' ? value.options : null}
                    styles={SharedSelectStyleProps}
                    loadOptions={loadOptions}
                    defaultOptions
                    components={{
                        DropdownIndicator: () => null,
                        IndicatorSeparator: () => null,
                    }}
                    onChange={(item) => {
                        onChange(
                            !!item
                                ? {
                                      kind: 'multi',
                                      options: item as readonly {
                                          label: string;
                                          value: string;
                                      }[],
                                  }
                                : undefined
                        );
                        if (value === undefined) {
                            setVisible(false);
                        }
                    }}
                    onBlur={() => setVisible(false)}
                    formatCreateLabel={(label) => label}
                    createOptionPosition="first"
                    allowCreateWhileLoading={false}
                    {...props}
                />
            );
    }
};

const SelectPopout = ({ value, ...props }: PopoutProps) => {
    // Visible by default if no value yet
    const [visible, setVisible] = useState(!value);
    const onSetVisible = (val: boolean) => {
        setVisible(val);
    };

    return (
        <Popover
            content={
                <PopoutContent
                    value={value}
                    setVisible={onSetVisible}
                    {...props}
                />
            }
            placement="bottomLeft"
            contentContainerClassName={styles.popover}
            visible={visible}
            destroyTooltipOnHide
        >
            <Button
                type="text"
                trackingId={`SessionsQuerySelect`}
                className={classNames(styles.ruleItem, {
                    [styles.invalid]: !value && !visible,
                })}
                onClick={() => onSetVisible(true)}
            >
                {value === undefined && '--'}
                {value?.kind === 'single' && value.label}
                {value?.kind === 'multi' &&
                    value.options.length > 1 &&
                    `${value.options.length} selections`}
                {value?.kind === 'multi' &&
                    value.options.length === 1 &&
                    value.options[0].label}
                {value?.kind === 'multi' && value.options.length === 0 && '--'}
            </Button>
        </Popover>
    );
};

const getPopoutType = (op: string): PopoutType => {
    switch (op) {
        case 'contains':
        case 'not_contains':
            return 'creatable';
        default:
            return 'multiselect';
    }
};

const QueryRule = ({
    rule,
    onChangeKey,
    getKeyOptions,
    onChangeOperator,
    getOperatorOptions,
    onChangeValue,
    getValueOptions,
    onRemove,
}: { rule: RuleProps } & RuleFuncs) => {
    return (
        <div className={styles.ruleContainer}>
            <SelectPopout
                value={rule.field}
                onChange={onChangeKey}
                loadOptions={getKeyOptions}
                type="select"
            />
            {!!rule.field && (
                <SelectPopout
                    value={getOperator(rule.op, isSingle(rule.val))}
                    onChange={onChangeOperator}
                    loadOptions={getOperatorOptions}
                    type="select"
                />
            )}
            {!!rule.op && hasArguments(rule.op) && (
                <SelectPopout
                    value={rule.val}
                    onChange={onChangeValue}
                    loadOptions={getValueOptions}
                    type={getPopoutType(rule.op)}
                />
            )}
            <Button
                trackingId="SessionsQueryRemoveRule"
                className={styles.ruleItem}
                onClick={() => {
                    onRemove();
                }}
            >
                <SvgXIcon />
            </Button>
        </div>
    );
};

const hasArguments = (op: string): boolean =>
    ['is', 'is_not', 'contains', 'not_contains'].includes(op);

const isNegative = (op: string): boolean =>
    ['is_not', 'not_contains', 'not_exists'].includes(op);

const LABEL_MAP_SINGLE: { [key: string]: string } = {
    is: 'is',
    is_not: 'is not',
    contains: 'contains',
    not_contains: 'does not contain',
    exists: 'exists',
    not_exists: 'does not exist',
};

const LABEL_MAP_MULTI: { [key: string]: string } = {
    is: 'is any of',
    is_not: 'is not any of',
    contains: 'contains any of',
    not_contains: 'does not contain any of',
    exists: 'exists',
    not_exists: 'does not exist',
};

const NEGATION_MAP: { [key: string]: string } = {
    is: 'is_not',
    is_not: 'is',
    contains: 'not_contains',
    not_contains: 'contains',
    exists: 'not_exists',
    not_exists: 'exists',
};

const OPERATORS: string[] = [
    'is',
    'is_not',
    'contains',
    'not_contains',
    'exists',
    'not_exists',
];

const getOperator = (
    value: string | undefined,
    isSingle: boolean
): SelectOption | undefined =>
    !value
        ? undefined
        : {
              kind: 'single',
              value: value,
              label: (isSingle ? LABEL_MAP_SINGLE : LABEL_MAP_MULTI)[value],
          };

const isSingle = (val: OnChangeInput) =>
    !(val?.kind === 'multi' && val.options.length > 1);

const CUSTOM_PREFIX = '_custom';

const parseInner = (field: string, op: string, value?: string): any => {
    if (field.startsWith(CUSTOM_PREFIX)) {
        const fieldName = field.substring(CUSTOM_PREFIX.length + 1);
        switch (op) {
            case 'is':
                return { term: { [`${fieldName}.keyword`]: value } };
            case 'contains':
                return {
                    wildcard: { [`${fieldName}.keyword`]: `*${value}*` },
                };
            case 'exists':
                return { exists: { field: fieldName } };
        }
    } else {
        switch (op) {
            case 'is':
                return { term: { 'fields.KeyValue': `${field}_${value}` } };
            case 'contains':
                return {
                    wildcard: { 'fields.KeyValue': `${field}_*${value}*` },
                };
            case 'exists':
                return { term: { 'fields.Key': field } };
        }
    }
};

const parseRuleImpl = (
    field: string,
    op: string,
    multiValue: MultiselectOption
): any => {
    if (isNegative(op)) {
        return {
            bool: {
                must_not: {
                    ...parseRuleImpl(field, NEGATION_MAP[op], multiValue),
                },
            },
        };
    } else if (hasArguments(op)) {
        return {
            bool: {
                should: multiValue.options.map(({ value }) =>
                    parseInner(field, op, value)
                ),
            },
        };
    } else {
        return parseInner(field, op);
    }
};

const parseRule = (rule: RuleProps): any => {
    const field = rule.field!.value;
    const multiValue = rule.val!;
    const op = rule.op!;

    return parseRuleImpl(field, op, multiValue);
};

const parseGroup = (isAnd: boolean, rules: RuleProps[]): any => ({
    bool: {
        [isAnd ? 'must' : 'should']: rules.map((rule) => parseRule(rule)),
    },
});

interface CustomField {
    hi: string;
}

const CUSTOM_FIELDS: (CustomField & Pick<Field, 'type' | 'name'>)[] = [
    {
        type: CUSTOM_PREFIX,
        name: 'app_version',
        hi: 'hi',
    },
    {
        type: CUSTOM_PREFIX,
        name: 'created_at',
        hi: 'hi',
    },
    {
        type: CUSTOM_PREFIX,
        name: 'active_length',
        hi: 'hi',
    },
];

const isComplete = (rule: RuleProps) =>
    rule.field !== undefined &&
    rule.op !== undefined &&
    (!hasArguments(rule.op) || rule.val !== undefined);

const QueryBuilder = () => {
    const { project_id } = useParams<{
        project_id: string;
    }>();

    const { setSearchQuery } = useSearchContext();

    const { data: fieldData } = useGetFieldTypesQuery({
        variables: { project_id },
    });

    const { refetch: fetchFields } = useGetFieldsOpensearchQuery({
        skip: true,
    });

    const { data: appVersionData } = useGetAppVersionsQuery({
        variables: { project_id },
    });

    const [currentRule, setCurrentRule] = useState<RuleProps | undefined>();

    const [rules, setRules] = useState<RuleProps[]>([]);
    const newRule = () => {
        setCurrentRule({
            field: undefined,
            op: undefined,
            val: undefined,
        });
        setStep1Visible(true);
    };
    const addRule = (rule: RuleProps) => {
        setRules([...rules, rule]);
        setCurrentRule(undefined);
    };
    const removeRule = (index: number) =>
        setRules(rules.filter((_, idx) => idx !== index));
    const updateRule = (index: number, newProps: any) => {
        setRules(
            rules.map((rule, idx) =>
                idx !== index ? rule : { ...rule, ...newProps }
            )
        );
    };

    const [isAnd, toggleIsAnd] = useToggle(true);

    const getKeyOptions = async (input: string) => {
        if (fieldData?.field_types === undefined) {
            return;
        }

        const results = fieldData?.field_types
            .concat(CUSTOM_FIELDS)
            .filter((ft) => ft.name.toLowerCase().includes(input.toLowerCase()))
            .map((ft) => ({
                label: ft.name,
                value: ft.type + '_' + ft.name,
            }));
        return results;
    };

    const getOperatorOptionsCallback = (isSingle: boolean) => {
        return async (input: string) => {
            return OPERATORS.map((op) =>
                getOperator(op, isSingle)
            ).filter((op) =>
                op?.label.toLowerCase().includes(input.toLowerCase())
            );
        };
    };

    const getValueOptionsCallback = (field: SelectOption | undefined) => {
        return async (input: string) => {
            if (field === undefined) {
                return;
            }

            if (field.value === '_custom_app_version') {
                console.log(
                    '_custom_app_version',
                    appVersionData?.app_version_suggestion
                );
                return appVersionData?.app_version_suggestion
                    .map((av) => ({
                        label: av,
                        value: av,
                    }))
                    .filter((op) =>
                        op?.label?.toLowerCase().includes(input.toLowerCase())
                    );
            }

            const [first, ...rest] = field.value.split('_');

            return await fetchFields({
                project_id,
                count: 10,
                field_type: first,
                field_name: rest.join('_'),
                query: input,
            }).then((res) => {
                return res.data.fields_opensearch.map((fd) => ({
                    label: fd.value,
                    value: fd.value,
                }));
            });
        };
    };

    useEffect(() => {
        const allComplete = rules.every(isComplete);

        if (!allComplete) {
            return;
        }

        const query = parseGroup(isAnd, rules);
        setSearchQuery(JSON.stringify(query));
    }, [isAnd, rules, setSearchQuery]);

    console.log('rules!', rules);
    console.log('currentRule!', currentRule);

    const [step1Visible, setStep1Visible] = useState(false);
    const [step2Visible, setStep2Visible] = useState(false);

    return (
        <div className={styles.builderContainer}>
            {rules.length > 0 && (
                <div className={styles.rulesContainer}>
                    {rules.flatMap((rule, index) => [
                        ...(index != 0
                            ? [
                                  <Button
                                      className={styles.separator}
                                      trackingId="SessionsQuerySeparatorToggle"
                                      onClick={toggleIsAnd}
                                      key={`separator-${index}`}
                                      type="dashed"
                                  >
                                      {isAnd ? 'and' : 'or'}
                                  </Button>,
                              ]
                            : []),
                        <QueryRule
                            key={`rule-${index}`}
                            rule={rule}
                            onChangeKey={(val) => {
                                // Default to 'is' when rule is not defined yet
                                if (rule.op === undefined) {
                                    updateRule(index, { field: val, op: 'is' });
                                } else {
                                    updateRule(index, { field: val });
                                }
                            }}
                            getKeyOptions={getKeyOptions}
                            onChangeOperator={(val) => {
                                if (val?.kind === 'single') {
                                    updateRule(index, { op: val.value });
                                }
                            }}
                            getOperatorOptions={getOperatorOptionsCallback(
                                isSingle(rule.val)
                            )}
                            onChangeValue={(val) => {
                                updateRule(index, { val: val });
                            }}
                            getValueOptions={getValueOptionsCallback(
                                rule.field
                            )}
                            onRemove={() => removeRule(index)}
                        />,
                    ])}
                </div>
            )}
            <div>
                <Popover
                    content={
                        currentRule?.field !== undefined ? (
                            <PopoutContent
                                key={'popover-2'}
                                value={undefined}
                                setVisible={setStep2Visible}
                                onChange={(val) => {
                                    addRule({
                                        ...currentRule,
                                        val: val as
                                            | MultiselectOption
                                            | undefined,
                                    });
                                }}
                                loadOptions={getValueOptionsCallback(
                                    currentRule.field
                                )}
                                type="multiselect"
                                placeholder={`Select a value for ${currentRule.field.label}`}
                            />
                        ) : (
                            <PopoutContent
                                key={'popover-1'}
                                value={undefined}
                                setVisible={setStep1Visible}
                                onChange={(val) => {
                                    setCurrentRule({
                                        field: val as SelectOption | undefined,
                                        op: 'is',
                                        val: undefined,
                                    });
                                    setStep2Visible(true);
                                }}
                                loadOptions={getKeyOptions}
                                type="select"
                                placeholder="Select a field"
                            />
                        )
                    }
                    placement="bottomLeft"
                    contentContainerClassName={styles.popover}
                    destroyTooltipOnHide
                    visible={step1Visible || step2Visible}
                >
                    <Button
                        className={styles.addFilter}
                        trackingId="SessionsQueryAddRule2"
                        onClick={newRule}
                    >
                        + Filter
                    </Button>
                </Popover>
            </div>
        </div>
    );
};

export default QueryBuilder;
