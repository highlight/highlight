import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext';
import QueryBuilder, {
    CUSTOM_TYPE,
    CustomField,
    DATE_OPERATORS,
    RANGE_OPERATORS,
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

const SessionsQueryBuilder = () => {
    const { setSearchQuery } = useSearchContext();
    return <QueryBuilder type="sessions" setSearchQuery={setSearchQuery} />;
};
export default SessionsQueryBuilder;
