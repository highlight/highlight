import { useEffect, useState } from 'react';
import { useLazyQuery, gql } from '@apollo/client';

export const useIntegrated = (
    initialValue: number
): { integrated: boolean; loading: boolean } => {
    const [query, { data }] = useLazyQuery<
        { isIntegrated: boolean },
        { organization_id: number }
    >(
        gql`
            query IsIntegrated($organization_id: ID!) {
                isIntegrated(organization_id: $organization_id)
            }
        `,
        {
            variables: { organization_id: initialValue },
            fetchPolicy: 'cache-and-network',
        }
    );
    const [integrated, setIntegrated] = useState<boolean | undefined>(
        undefined
    );
    const [loading, setLoading] = useState<boolean>(true);
    const integratedRaw = data?.isIntegrated;

    useEffect(() => {
        query();
        const timer = setInterval(() => {
            if (!integrated) {
                query();
            }
        }, 5000);
        return () => {
            clearInterval(timer);
        };
    }, [integrated, query]);

    useEffect(() => {
        if (integratedRaw !== undefined) {
            setIntegrated(integratedRaw);
        }
    }, [integratedRaw]);

    useEffect(() => {
        if (integrated === undefined) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [integrated]);

    return { integrated: integrated ?? false, loading };
};
