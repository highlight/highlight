import { useEffect, useState } from 'react';
import { useIsIntegratedLazyQuery } from '../graph/generated/hooks';

export const useIntegrated = (
    organization_id: number
): { integrated: boolean; loading: boolean } => {
    const [query, { data, loading }] = useIsIntegratedLazyQuery({
        variables: { organization_id: organization_id.toString() },
        fetchPolicy: 'cache-and-network',
    });
    const [integrated, setIntegrated] = useState<boolean | undefined>(
        undefined
    );
    const [loadingState, setLoadingState] = useState(true);
    const integratedRaw = data?.isIntegrated;

    useEffect(() => {
        query();
        const timer = setInterval(() => {
            if (!integrated) {
                query();
            } else {
                clearInterval(timer);
            }
        }, 5000);
        return () => {
            clearInterval(timer);
        };
    }, [integrated, query]);

    useEffect(() => {
        if (integratedRaw !== undefined) {
            setIntegrated(integratedRaw?.valueOf());
        }
    }, [integratedRaw]);

    useEffect(() => {
        if (loading === false) {
            setLoadingState(false);
        }
    }, [loading]);

    return { integrated: integrated || false, loading: loadingState };
};
