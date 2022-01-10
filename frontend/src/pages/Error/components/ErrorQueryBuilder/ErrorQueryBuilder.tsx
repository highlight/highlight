import { useGetErrorFieldsOpensearchQuery } from '@graph/hooks';
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext';
import QueryBuilder, {
    CUSTOM_TYPE,
    CustomField,
    DATE_OPERATORS,
    ERROR_TYPE,
    FetchFieldVariables,
} from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/QueryBuilder';
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

const ErrorQueryBuilder = () => {
    const { setSearchQuery } = useErrorSearchContext();
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
        />
    );
};
export default ErrorQueryBuilder;
