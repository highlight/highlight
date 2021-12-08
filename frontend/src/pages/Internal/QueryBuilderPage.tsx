// import 'antd/dist/antd.css'; // or import "react-awesome-query-builder/css/antd.less";
// For Material-UI widgets only:
//import MaterialConfig from "react-awesome-query-builder/lib/config/material";
import 'react-awesome-query-builder/lib/css/styles.css';
import 'react-awesome-query-builder/lib/css/compact_styles.css'; //optional, for more compact styles

import Button from '@components/Button/Button/Button';
import {
    useGetFieldTypesQuery,
    useGetSessionsOpenSearchLazyQuery,
} from '@graph/hooks';
import React, { useState } from 'react';
import {
    Builder,
    JsonItem,
    JsonRule,
    Operator,
    Query,
    TypedMap,
    Utils as QbUtils,
} from 'react-awesome-query-builder';
// types
import {
    BuilderProps,
    Config,
    ImmutableTree,
    JsonGroup,
} from 'react-awesome-query-builder';
// For AntDesign widgets only:
import AntdConfig from 'react-awesome-query-builder/lib/config/antd';

// Choose your skin (ant/material/vanilla):
const InitialConfig = AntdConfig; // or MaterialConfig or BasicConfig

// You can load query value from your backend storage (for saving see `Query.onChange()`)
const queryValue: JsonGroup = { id: QbUtils.uuid(), type: 'group' };

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
        case 'equal':
            return {
                term: { 'fields.KeyValue': `${field}_${value}` },
            };
        case 'not_equal':
            return {
                term: { 'fields.KeyValue': `${field}_${value}` },
            };
        case 'like':
            return {
                wildcard: {
                    'fields.KeyValue': { value: `${field}_*${value}*` },
                },
            };
        case 'not_like':
            return {
                wildcard: {
                    'fields.KeyValue': { value: `${field}_*${value}*` },
                },
            };
        case 'is_not_empty':
            return { term: { 'fields.Key': field } };
        case 'is_empty':
            return { term: { 'fields.Key': field } };
    }
};

const parseGroup = (tree: JsonGroup): any => {
    if (tree.properties?.conjunction === 'OR') {
        return {
            bool: {
                //@ts-ignore
                should: parseChildren(tree.children1!),
            },
        };
    } else {
        return {
            bool: {
                //@ts-ignore
                must: parseChildren(tree.children1!),
            },
        };
    }
};

const QueryBuilderPage: React.FC = () => {
    const { data, loading } = useGetFieldTypesQuery({
        variables: { project_id: '1' },
    });

    const [
        getSessions,
        { error, data: sessionsData, called, refetch },
    ] = useGetSessionsOpenSearchLazyQuery({ fetchPolicy: 'no-cache' });

    const fields =
        data?.field_types.reduce(
            (a, ft) => ({
                ...a,
                [ft.type + '_' + ft.name]: {
                    label: ft.name,
                    type: 'text',
                },
            }),
            {}
        ) ?? {};

    const operators: TypedMap<Operator> = {
        equal: {
            label: 'is',
            cardinality: 1,
        },
        not_equal: {
            label: 'is not',
            cardinality: 1,
        },
        like: {
            label: 'contains',
            cardinality: 1,
        },
        not_like: {
            label: 'does not contain',
            cardinality: 1,
        },
        is_not_empty: {
            label: 'exists',
            cardinality: 0,
        },
        is_empty: {
            label: 'does not exist',
            cardinality: 0,
        },
    };

    // You need to provide your own config. See below 'Config format'
    const config: Config = {
        ...InitialConfig,
        fields,
        operators,
    };

    const [state, setState] = useState({
        tree: QbUtils.checkTree(QbUtils.loadTree(queryValue), config),
        config: config,
    });

    if (loading) {
        return null;
    }

    const onChange = (immutableTree: ImmutableTree, config: Config) => {
        // Tip: for better performance you can apply `throttle` - see `examples/demo`
        setState({ tree: immutableTree, config: config });

        const jsonTree = QbUtils.getTree(immutableTree);
        console.log('jsonTree', jsonTree);
        // `jsonTree` can be saved to backend, and later loaded to `queryValue`
    };

    const renderBuilder = (props: BuilderProps) => (
        <div className="query-builder-container" style={{ padding: '10px' }}>
            <div className="query-builder qb-lite">
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
                    Query string:{' '}
                    <pre>
                        {JSON.stringify(
                            QbUtils.queryString(state.tree, state.config)
                        )}
                    </pre>
                </div>
                <div>
                    Elastic:{' '}
                    <pre>
                        {JSON.stringify(
                            parseGroup(QbUtils.getTree(state.tree))
                        )}
                        {/* <JsonViewer
                            collapsed={false}
                            src={
                                QbUtils.elasticSearchFormat(
                                    state.tree,
                                    state.config
                                ) || {}
                            }
                        /> */}
                        {/* {JSON.stringify(
                            QbUtils.elasticSearchFormat(
                                state.tree,
                                state.config
                            )
                        )} */}
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
        </div>
    );
};

export default QueryBuilderPage;
