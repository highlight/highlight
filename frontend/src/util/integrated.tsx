import { useEffect, useState } from 'react';
import { useIsIntegratedLazyQuery } from '../graph/generated/hooks';

export const useIntegrated = (
    organization_id: number
): { integrated: boolean; loading: boolean } => {
    const [query, { data }] = useIsIntegratedLazyQuery({
        variables: { organization_id: organization_id.toString() },
        fetchPolicy: 'cache-and-network',
    });
    const [integrated, setIntegrated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
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
            setIntegrated(integratedRaw || false);
        }
    }, [integratedRaw]);

    useEffect(() => {
        if (integrated === undefined) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [integrated]);

    return { integrated, loading };
};
