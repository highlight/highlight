import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext';
import QueryBuilder, {
    CUSTOM_TYPE,
    CustomField,
    DATE_OPERATORS,
    ERROR_TYPE,
} from '@pages/Sessions/SessionsFeedV2/components/QueryBuilder/QueryBuilder';
import React from 'react';

const CUSTOM_FIELDS: CustomField[] = [
    {
        type: CUSTOM_TYPE,
        name: 'type',
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
    const { refetch: fetchFields } = {
        skip: true,
    };

    return (
        <QueryBuilder
            setSearchQuery={setSearchQuery}
            customFields={CUSTOM_FIELDS}
            fetchFields={function (
                variables?: Partial<
                    Exact<{
                        project_id: string;
                        count: number;
                        field_type: string;
                        field_name: string;
                        query: string;
                    }>
                >
            ): Promise<ApolloQueryResult<GetFieldsOpensearchQuery>> {
                throw new Error('Function not implemented.');
            }}
            fieldData={undefined}
        />
    );
};
export default ErrorQueryBuilder;
