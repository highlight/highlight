// import 'antd/dist/antd.css'; // or import "react-awesome-query-builder/css/antd.less";
// For Material-UI widgets only:
//import MaterialConfig from "react-awesome-query-builder/lib/config/material";
import 'react-awesome-query-builder/lib/css/styles.css';
import 'react-awesome-query-builder/lib/css/compact_styles.css'; //optional, for more compact styles

import Button from '@components/Button/Button/Button';
import {
    useGetFieldsOpensearchQuery,
    useGetFieldTypesQuery,
    useGetSessionsOpenSearchLazyQuery,
} from '@graph/hooks';
import { SharedSelectStyleProps } from '@pages/Sessions/SearchInputs/SearchInputUtil';
import { Col } from 'antd';
import React, { useState } from 'react';
import {
    Builder,
    JsonItem,
    JsonRule,
    Operators,
    Query,
    Types,
    Utils as QbUtils,
    Widgets,
} from 'react-awesome-query-builder';
// types
import {
    BuilderProps,
    Config,
    ImmutableTree,
    JsonGroup,
} from 'react-awesome-query-builder';
import AntdConfig from 'react-awesome-query-builder/lib/config/antd';
import { OptionsType, OptionTypeBase, ValueType } from 'react-select';
import AsyncCreatableSelect from 'react-select/async-creatable';

// Choose your skin (ant/material/vanilla):
const InitialConfig = AntdConfig; // or MaterialConfig or BasicConfig

// You can load query value from your backend storage (for saving see `Query.onChange()`)
const queryValue: JsonGroup = { id: QbUtils.uuid(), type: 'group' };

interface AutoCompleteWidgetProps {
    setValue: (v: string) => void;
    placeholder: string;
    config: any;
    value: string;
    field: string;
    readonly: boolean;
    customProps: object;
    maxLength: number;
}

const AutoCompleteWidget: React.FC<
    React.PropsWithChildren<React.PropsWithChildren<AutoCompleteWidgetProps>>
> = (props: AutoCompleteWidgetProps) => {
    const { refetch } = useGetFieldsOpensearchQuery({
        skip: true,
        fetchPolicy: 'no-cache',
    });

    const [first, ...rest] = props.field.split('_');

    const { placeholder, customProps, value, readonly } = props;

    const generateOptions = async (
        input: string
    ): Promise<OptionsType<OptionTypeBase> | void[]> => {
        const fetched = await refetch({
            project_id: '1',
            count: 10,
            field_type: first,
            field_name: rest.join('_'),
            query: input,
        });
        const suggestions = (fetched.data.fields_opensearch ?? [])?.map(
            (val) => ({ label: val, value: val })
        );
        return suggestions;
    };

    const onChange = (
        current: ValueType<{ label: string; value: string }, false>
    ) => {
        props.setValue(current?.value ?? '');
    };

    return (
        <Col style={{ width: '300px' }}>
            <AsyncCreatableSelect
                allowCreateWhileLoading={false}
                placeholder={placeholder}
                isClearable
                cacheOptions
                value={{ label: value, value: value }}
                styles={{
                    ...SharedSelectStyleProps,
                    option: (provided) => ({
                        ...provided,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        direction: 'ltr',
                        textAlign: 'left',
                    }),
                }}
                loadOptions={generateOptions}
                components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                }}
                formatCreateLabel={(inputValue: string) => inputValue}
                defaultOptions
                onChange={onChange}
                isDisabled={readonly}
                {...customProps}
            />
        </Col>
    );
};

const parseChildren = (children: { [id: string]: JsonItem }): any => {
    const ret = [];
    for (const k in children) {
        const val = children[k];
        switch (val.type) {
            case 'rule':
                ret.push(parseRule(val));
                break;
            case 'group':
                ret.push(parseGroup(val));
                break;
        }
    }
    return ret;
};

const parseRule = (rule: JsonRule): any => {
    const field = rule.properties.field;
    const value = rule.properties.value[0];

    switch (rule.properties.operator) {
        case 'is':
            return {
                term: { 'fields.KeyValue': `${field}_${value}` },
            };
        case 'is_not':
            return {
                bool: {
                    must_not: {
                        term: { 'fields.KeyValue': `${field}_${value}` },
                    },
                },
            };
        case 'contains':
            return {
                wildcard: {
                    'fields.KeyValue': { value: `${field}_*${value}*` },
                },
            };
        case 'not_contains':
            return {
                bool: {
                    must_not: {
                        wildcard: {
                            'fields.KeyValue': { value: `${field}_*${value}*` },
                        },
                    },
                },
            };
        case 'exists':
            return { term: { 'fields.Key': field } };
        case 'not_exists':
            return {
                bool: {
                    must_not: { term: { 'fields.Key': field } },
                },
            };
    }
};

const parseGroup = (tree: JsonGroup): any => {
    if (tree.properties?.conjunction === 'OR') {
        return {
            bool: {
                // @ts-expect-error
                should: parseChildren(tree.children1!),
            },
        };
    } else {
        return {
            bool: {
                // @ts-expect-error
                must: parseChildren(tree.children1!),
            },
        };
    }
};

const OpenSearchQueryPage: React.FC<
    React.PropsWithChildren<React.PropsWithChildren<unknown>>
> = () => {
    const { data, loading } = useGetFieldTypesQuery({
        variables: { project_id: '1' },
    });

    const [getSessions, { data: sessionsData, loading: sessionsLoading }] =
        useGetSessionsOpenSearchLazyQuery({ fetchPolicy: 'no-cache' });

    const fields =
        data?.field_types.reduce(
            (a, ft) => ({
                ...a,
                [ft.type + '_' + ft.name]: {
                    label: ft.name,
                    type: 'autocomplete',
                    valueSources: ['value'],
                },
            }),
            {}
        ) ?? {};

    const operators: Operators = {
        is: {
            label: 'is',
            cardinality: 1,
        },
        is_not: {
            label: 'is not',
            cardinality: 1,
        },
        contains: {
            label: 'contains',
            cardinality: 1,
        },
        not_contains: {
            label: 'does not contain',
            cardinality: 1,
        },
        exists: {
            label: 'exists',
            cardinality: 0,
        },
        not_exists: {
            label: 'does not exist',
            cardinality: 0,
        },
    };

    const types: Types = {
        autocomplete: {
            valueSources: ['value'],
            defaultOperator: 'is',
            widgets: {
                autocomplete: {
                    operators: [
                        'is',
                        'is_not',
                        'contains',
                        'not_contains',
                        'exists',
                        'not_exists',
                    ],
                },
            },
        },
    };

    const widgets: Widgets = {
        autocomplete: {
            type: 'select',
            valueSrc: 'value',
            factory: (props) => {
                // @ts-expect-error
                return <AutoCompleteWidget {...props} />;
            },
            formatValue: (val) => val,
            mongoFormatValue: (val) => val,
            sqlFormatValue: (val) => val,
            valueLabel: 'Text',
            valuePlaceholder: 'Enter text',
        },
    };

    // You need to provide your own config. See below 'Config format'
    const config: Config = {
        ...InitialConfig,
        fields,
        operators,
        types,
        widgets,
    };

    config.settings.showNot = false;

    const [state, setState] = useState({
        tree: QbUtils.checkTree(QbUtils.loadTree(queryValue), config),
        config: config,
    });

    if (loading) {
        return null;
    }

    const onChange = (immutableTree: ImmutableTree, config: Config) => {
        setState({ tree: immutableTree, config: config });
    };

    const renderBuilder = (props: BuilderProps) => (
        <div className="query-builder-container" style={{ padding: '10px' }}>
            <div
                className="query-builder qb-lite"
                style={{ minHeight: '400px' }}
            >
                <Builder {...props} />
            </div>
        </div>
    );

    const onSubmit = () => {
        getSessions({
            variables: {
                project_id: '1',
                count: 100,
                query: JSON.stringify(parseGroup(QbUtils.getTree(state.tree))),
                sort_desc: true,
            },
        });
    };

    return (
        <div>
            <Query
                {...config}
                value={state.tree}
                onChange={onChange}
                renderBuilder={renderBuilder}
            />
            <div className="query-builder-result">
                <div>
                    Elastic:{' '}
                    <pre>
                        {JSON.stringify(
                            parseGroup(QbUtils.getTree(state.tree))
                        )}
                    </pre>
                </div>
                <div>
                    <Button
                        trackingId="GetSessionsOpensearch"
                        onClick={onSubmit}
                        type="primary"
                    >
                        Submit
                    </Button>
                </div>
            </div>
            {!sessionsLoading && (
                <div>
                    {sessionsData?.sessions_opensearch.totalCount ?? 0} results
                </div>
            )}
        </div>
    );
};

export default OpenSearchQueryPage;
