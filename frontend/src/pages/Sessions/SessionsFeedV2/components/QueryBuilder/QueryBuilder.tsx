import Button from '@components/Button/Button/Button';
import Popover from '@components/Popover/Popover';
import SvgXIcon from '@icons/XIcon';
import { SharedSelectStyleProps } from '@pages/Sessions/SearchInputs/SearchInputUtil';
import { useParams } from '@util/react-router/useParams';
import classNames from 'classnames';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useMemo } from 'react';
import AsyncSelect from 'react-select/async';
import { useToggle } from 'react-use';

import {
    useGetFieldsOpensearchQuery,
    useGetFieldTypesQuery,
    useGetSessionSearchResultsQuery,
} from '../../../../../graph/generated/hooks';
import useSelectedSessionSearchFilters from '../../../../../persistedStorage/useSelectedSessionSearchFilters';
import { usePlayerUIContext } from '../../../../Player/context/PlayerUIContext';
import { useSearchContext } from '../../../SearchContext/SearchContext';
import styles from './QueryBuilder.module.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RuleProps {
    ruleKey: SelectOption;
    ruleOp: SelectOption;
    ruleVal: SelectOption;
}

interface Cardinality {
    cardinality: number;
}

type SelectOption = { label: string; value: string } | undefined;
type OnChange = (val: SelectOption) => void;
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

interface PopoutProps {
    value: SelectOption;
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
}: PopoutProps & SetVisible) => {
    return (
        <AsyncSelect
            autoFocus
            openMenuOnFocus
            value={value ?? null}
            styles={SharedSelectStyleProps}
            loadOptions={loadOptions}
            defaultOptions
            components={{
                DropdownIndicator: () => null,
                IndicatorSeparator: () => null,
            }}
            onChange={(item) => onChange(item ?? undefined)}
            onBlur={() => setVisible(false)}
        />
    );
};

const SelectPopout = ({ value, onChange, ...props }: PopoutProps) => {
    // Visible by default if no value yet
    const [visible, setVisible] = useState(!value);

    return (
        <Popover
            content={
                <PopoutContent
                    value={value}
                    onChange={(val) => {
                        setVisible(false);
                        onChange(val);
                    }}
                    setVisible={setVisible}
                    {...props}
                />
            }
            placement="bottomLeft"
            trigger={['click']}
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
                onClick={() => setVisible(true)}
            >
                {value?.label ?? '--'}
            </Button>
        </Popover>
    );
};

const getInput = (
    ruleOp: string,
    popoutProps: PopoutProps
): React.ReactNode | undefined => {
    if (!!ruleOp && CARDINALITY_MAP[ruleOp] >= 0) {
        return <SelectPopout {...popoutProps} />;
    }
};

const QueryRule = ({
    ruleKey,
    ruleOp,
    ruleVal,
    onChangeKey,
    getKeyOptions,
    onChangeOperator,
    getOperatorOptions,
    onChangeValue,
    getValueOptions,
    onRemove,
}: RuleProps & RuleFuncs) => {
    return (
        <div className={styles.ruleContainer}>
            <SelectPopout
                value={ruleKey}
                onChange={onChangeKey}
                loadOptions={getKeyOptions}
            />
            {!!ruleKey && (
                <SelectPopout
                    value={ruleOp}
                    onChange={onChangeOperator}
                    loadOptions={getOperatorOptions}
                />
            )}
            {!!ruleOp &&
                getInput(ruleOp.value, {
                    value: ruleVal,
                    onChange: onChangeValue,
                    loadOptions: getValueOptions,
                })}
            <Button
                trackingId="SessionsQueryRemoveRule"
                className={styles.ruleItem}
                onClick={onRemove}
            >
                <SvgXIcon />
            </Button>
        </div>
    );
};

const IS_OPERATOR = {
    value: 'is',
    label: 'is',
    cardinality: 1,
};

const CARDINALITY_MAP: { [key: string]: number } = {
    is: 1,
    is_not: 1,
    contains: 1,
    not_contains: 1,
    exists: 0,
    not_exists: 0,
};

const OPERATORS = [
    IS_OPERATOR,
    {
        value: 'is_not',
        label: 'is not',
        cardinality: 1,
    },
    {
        value: 'contains',
        label: 'contains',
        cardinality: 1,
    },
    {
        value: 'not_contains',
        label: 'does not contain',
        cardinality: 1,
    },
    {
        value: 'exists',
        label: 'exists',
        cardinality: 0,
    },
    {
        value: 'not_exists',
        label: 'does not exist',
        cardinality: 0,
    },
];

const QueryBuilder = () => {
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const [query, setQuery] = useState('');
    const [selectedProperties, setSelectedProperties] = useState<
        SessionSearchOption[]
    >([]);
    const { searchParams, setSearchParams } = useSearchContext();
    const { setSearchBarRef } = usePlayerUIContext();
    const { selectedSearchFilters } = useSelectedSessionSearchFilters();

    const { data: fieldData } = useGetFieldTypesQuery({
        variables: { project_id },
    });

    const { refetch: fetchFields } = useGetFieldsOpensearchQuery({
        skip: true,
    });

    const { loading, data, refetch } = useGetSessionSearchResultsQuery({
        variables: {
            project_id,
            query: '',
        },
    });

    const [rules, setRules] = useState<RuleProps[]>([]);
    const addRule = () =>
        setRules([
            ...rules,
            { ruleKey: undefined, ruleOp: undefined, ruleVal: undefined },
        ]);
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
        const results = fieldData?.field_types
            .filter((ft) => ft.name.includes(input))
            .map((ft) => ({
                label: ft.name,
                value: ft.type + '_' + ft.name,
            }));
        return results;
    };

    const getOperatorOptions = async (input: string) => {
        return OPERATORS.filter((op) => op.label.includes(input));
    };

    const getValueOptionsCallback = (ruleKey: SelectOption) => {
        return async (input: string) => {
            if (ruleKey === undefined) {
                return;
            }

            const [first, ...rest] = ruleKey.value.split('_');

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

    const generateOptions = (input: string, callback: any) => {
        refetch({
            project_id,
            query: input,
        }).then((fetched) => {
            callback(
                getSuggestions(fetched.data, selectedSearchFilters, input, 3)
            );
        });
    };

    const debouncedGenerateOptions = useMemo(
        () => _.debounce(generateOptions, 200),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    useEffect(() => {
        if (searchParams) {
            const userProperties = (
                searchParams.user_properties || []
            ).map((property) => transformToOption(property, 'userProperties'));
            const trackProperties = (
                searchParams.track_properties || []
            ).map((property) => transformToOption(property, 'trackProperties'));
            const visitedUrl =
                (searchParams.visited_url?.length || 0) > 0
                    ? searchParams.visited_url
                    : undefined;
            const referrer =
                (searchParams.referrer?.length || 0) > 0
                    ? searchParams.referrer
                    : undefined;

            const selectedValues: SessionSearchOption[] = [
                ...userProperties,
                ...trackProperties,
            ];

            if (visitedUrl) {
                selectedValues.push({
                    apiType: 'visitedUrls',
                    id: visitedUrl,
                    name: visitedUrl,
                    value: `visitedUrl:${visitedUrl}`,
                    valueType: 'visitedUrl',
                });
            }
            if (referrer) {
                selectedValues.push({
                    apiType: 'referrers',
                    id: referrer,
                    name: referrer,
                    value: `referrer:${referrer}`,
                    valueType: 'referrer',
                });
            }

            setSelectedProperties(selectedValues);
        }
    }, [searchParams]);

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
                                      type="text"
                                  >
                                      {isAnd ? 'and' : 'or'}
                                  </Button>,
                              ]
                            : []),
                        <QueryRule
                            key={`rule-${index}`}
                            ruleKey={rule.ruleKey}
                            ruleOp={rule.ruleOp}
                            ruleVal={rule.ruleVal}
                            onChangeKey={(val: SelectOption) => {
                                console.log('onChangeKey', val);
                                return updateRule(index, {
                                    ruleKey: val,
                                    ruleOp: IS_OPERATOR,
                                });
                            }}
                            getKeyOptions={getKeyOptions}
                            onChangeOperator={(val: SelectOption) => {
                                console.log('onChangeOperator', val);
                                return updateRule(index, { ruleOp: val });
                            }}
                            getOperatorOptions={getOperatorOptions}
                            onChangeValue={(val: SelectOption) => {
                                console.log('onChangeValue', val);
                                return updateRule(index, { ruleVal: val });
                            }}
                            getValueOptions={getValueOptionsCallback(
                                rule.ruleKey
                            )}
                            onRemove={() => removeRule(index)}
                        />,
                    ])}
                </div>
            )}
            <div>
                <Button
                    className={styles.addFilter}
                    trackingId="SessionsQueryAddRule"
                    onClick={addRule}
                >
                    + Filter
                </Button>
            </div>
        </div>
    );
};

export default QueryBuilder;

/**
 * The session properties that support search.
 */
type API_TYPES =
    | 'trackProperties'
    | 'userProperties'
    | 'visitedUrls'
    | 'referrers';

export interface SessionSearchOption {
    valueType: string;
    name: string;
    id: string;
    value: string;
    apiType: API_TYPES;
}

interface Suggestion {
    id: string;
    name: string;
    value: string;
}

const transformToOption = (
    { id, name, value }: Suggestion,
    apiType: API_TYPES
): SessionSearchOption => {
    const valueToUse = value;

    if (
        valueToUse.split(':').length === 2 &&
        !valueToUse.includes('https://')
    ) {
        const [value, name] = valueToUse.split(':');
        return {
            id,
            valueType: value,
            name,
            value: valueToUse,
            apiType,
        };
    }

    return {
        id,
        valueType: name,
        name: value,
        value: `${name}:${value}`,
        apiType,
    };
};

const getSuggestions = (
    data: any,
    selectedTypes: string[],
    query: string,
    limitResultsCount?: number
) => {
    const suggestions: {
        label: string;
        tooltip: string | React.ReactNode;
        options: SessionSearchOption[];
    }[] = [];

    if (selectedTypes.includes('Track Properties')) {
        suggestions.push({
            label: 'Track Properties',
            tooltip: (
                <>
                    Track Properties are properties related to events that have
                    happened in your application. These are set by you in your
                    application. You can{' '}
                    <a
                        href="https://docs.highlight.run/tracking-events"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        learn more here
                    </a>
                    .
                </>
            ),
            options: [
                ...getIncludesOption(query, 'trackProperties', 'track'),
                ...(data?.trackProperties
                    ?.map((suggestion: Suggestion) =>
                        transformToOption(suggestion, 'trackProperties')
                    )
                    .slice(0, limitResultsCount) || []),
            ],
        });
    }
    if (selectedTypes.includes('User Properties')) {
        suggestions.push({
            label: 'User Properties',
            tooltip: (
                <>
                    User Properties are properties related to the user. These
                    are set by you in your application. You can{' '}
                    <a
                        href="https://docs.highlight.run/identifying-users"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        learn more here
                    </a>
                    .
                </>
            ),
            options: [
                ...getIncludesOption(query, 'userProperties', 'user'),
                ...(data?.userProperties
                    ?.map((suggestion: Suggestion) =>
                        transformToOption(suggestion, 'userProperties')
                    )
                    .slice(0, limitResultsCount) || []),
            ],
        });
    }
    if (selectedTypes.includes('Visited URLs')) {
        suggestions.push({
            label: 'Visited URLs',
            tooltip:
                'Visited URLs are the URLs a user has visited. Filtering with a Visited URL will show you all sessions where a user visited that URL.',
            options: [
                ...getIncludesOption(query, 'visitedUrls', 'visitedUrl'),
                ...(data?.visitedUrls
                    ?.map((suggestion: Suggestion) =>
                        transformToOption(suggestion, 'visitedUrls')
                    )
                    .slice(0, limitResultsCount) || []),
            ],
        });
    }
    if (selectedTypes.includes('Referrers')) {
        suggestions.push({
            label: 'Referrers',
            tooltip:
                'Referrers are the websites your users came from. For example, if a user on Twitter clicked a link to your application, the referrer would be Twitter.',
            options: [
                ...getIncludesOption(query, 'referrers', 'referrers'),
                ...(data?.referrers
                    ?.map((suggestion: Suggestion) =>
                        transformToOption(suggestion, 'referrers')
                    )
                    .slice(0, limitResultsCount) || []),
            ],
        });
    }

    return suggestions;
};

const getIncludesOption = (
    query: string,
    apiType: string,
    valueType: string
) => {
    return query.length === 0
        ? []
        : [
              {
                  apiType,
                  id: '-1',
                  name: `Contains: ${query}`,
                  value: `${query}`,
                  valueType,
              },
          ];
};

const transformSelectedProperties = (selectedProperties: any[]) => {
    return selectedProperties?.map((property) => {
        if (property.value.includes('contains:')) {
            return {
                ...property,
                name: 'contains',
                value: property.name,
            };
        }
        if (property.name.includes('Contains:')) {
            if (
                property.apiType === 'visitedUrls' ||
                property.apiType === 'referrers'
            ) {
                return {
                    ...property,
                    name: property.value,
                };
            }
            return {
                ...property,
                name: 'contains',
            };
        }
        return property;
    });
};
