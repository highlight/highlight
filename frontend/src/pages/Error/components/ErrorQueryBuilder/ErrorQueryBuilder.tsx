import { useGetErrorFieldsOpensearchQuery } from '@graph/hooks';
import {
    ErrorSearchParams,
    useErrorSearchContext,
} from '@pages/Errors/ErrorSearchContext/ErrorSearchContext';
import QueryBuilder, {
    CUSTOM_TYPE,
    CustomField,
    DATE_OPERATORS,
    deserializeGroup,
    ERROR_TYPE,
    FetchFieldVariables,
    QueryBuilderState,
    RuleProps,
    serializeRules,
} from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/QueryBuilder';
import moment from 'moment';
import React from 'react';

const CUSTOM_FIELDS: CustomField[] = [
    {
        type: CUSTOM_TYPE,
        name: 'Type',
        options: {
            type: 'text',
        },
    },
    {
        type: CUSTOM_TYPE,
        name: 'created_at',
        options: {
            operators: DATE_OPERATORS,
            type: 'date',
        },
    },
    {
        type: CUSTOM_TYPE,
        name: 'state',
        options: {
            type: 'text',
        },
    },
    {
        type: ERROR_TYPE,
        name: 'browser',
        options: {
            type: 'text',
        },
    },
    {
        type: ERROR_TYPE,
        name: 'event',
        options: {
            type: 'text',
        },
    },
    {
        type: ERROR_TYPE,
        name: 'os_name',
        options: {
            type: 'text',
        },
    },
    {
        type: ERROR_TYPE,
        name: 'visited_url',
        options: {
            type: 'text',
        },
    },
];

// If there is no query builder param (for segments saved
// before the query builder was released), create one.
export const getQueryFromParams = (
    params: ErrorSearchParams
): QueryBuilderState => {
    const rules: RuleProps[] = [];
    if (params.date_range) {
        const start = moment(params.date_range.start_date).toISOString();
        const end = moment(params.date_range.end_date).toISOString();
        rules.push(
            deserializeGroup('custom_created_at', 'between_date', [
                `${start}_${end}`,
            ])
        );
    }
    if (params.event) {
        rules.push(deserializeGroup('error_event', 'is', [params.event]));
    }
    if (params.os) {
        rules.push(deserializeGroup('error_os_name', 'is', [params.os]));
    }
    if (params.state) {
        rules.push(deserializeGroup('custom_state', 'is', [params.state]));
    } else {
        rules.push(deserializeGroup('custom_state', 'is', ['OPEN']));
    }
    if (params.type) {
        rules.push(deserializeGroup('custom_Type', 'is', [params.type]));
    }
    if (params.visited_url) {
        rules.push(
            deserializeGroup('error_visited_url', 'is', [params.visited_url])
        );
    }
    return {
        isAnd: true,
        rules: serializeRules(rules),
    };
};

const ErrorQueryBuilder = () => {
    const {
        setSearchQuery,
        searchParams,
        setSearchParams,
    } = useErrorSearchContext();
    const { refetch } = useGetErrorFieldsOpensearchQuery({
        skip: true,
    });
    const fetchFields = (variables: FetchFieldVariables) =>
        refetch(variables).then((r) => r.data.error_fields_opensearch);

    return (
        <QueryBuilder
            setSearchQuery={setSearchQuery}
            customFields={CUSTOM_FIELDS}
            fetchFields={fetchFields}
            getQueryFromParams={getQueryFromParams}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
        />
    );
};
export default ErrorQueryBuilder;
