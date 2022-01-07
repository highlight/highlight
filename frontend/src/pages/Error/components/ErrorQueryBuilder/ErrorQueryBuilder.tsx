import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext';
import QueryBuilder, {
    CustomField,
} from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/QueryBuilder';
import React from 'react';

const CUSTOM_FIELDS: CustomField[] = [
    {
        type: CUSTOM_TYPE,
        name: 'app_version',
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
        name: 'active_length',
        options: {
            operators: RANGE_OPERATORS,
            type: 'long',
        },
    },
    {
        type: CUSTOM_TYPE,
        name: 'viewed',
        options: {
            type: 'boolean',
        },
    },
    {
        type: CUSTOM_TYPE,
        name: 'processed',
        options: {
            type: 'boolean',
        },
    },
    {
        type: CUSTOM_TYPE,
        name: 'first_time',
        options: {
            type: 'boolean',
        },
    },
    {
        type: CUSTOM_TYPE,
        name: 'starred',
        options: {
            type: 'boolean',
        },
    },
];

const ErrorQueryBuilder = () => {
    const { setSearchQuery } = useErrorSearchContext();

    return <QueryBuilder type="errors" setSearchQuery={setSearchQuery} />;
};
export default ErrorQueryBuilder;
