import useLocalStorage from '@rehooks/local-storage';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useIsIntegratedLazyQuery } from '../graph/generated/hooks';

export const useIntegrated = (): { integrated: boolean; loading: boolean } => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const [query, { data, loading }] = useIsIntegratedLazyQuery({
        variables: { organization_id: organization_id.toString() },
        fetchPolicy: 'cache-and-network',
    });
    const [localStorageIntegrated, setLocalStorageIntegrated] = useLocalStorage(
        `highlight-${organization_id}-integrated`,
        false
    );
    const [integrated, setIntegrated] = useState<boolean | undefined>(
        undefined
    );
    const [loadingState, setLoadingState] = useState(true);
    const integratedRaw = data?.isIntegrated;

    useEffect(() => {
        if (!localStorageIntegrated) {
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
        } else {
            setLoadingState(false);
            setIntegrated(localStorageIntegrated);
        }
    }, [integrated, localStorageIntegrated, query]);

    useEffect(() => {
        if (integratedRaw !== undefined) {
            setIntegrated(integratedRaw?.valueOf());
            setLocalStorageIntegrated(integratedRaw?.valueOf() || false);
        }
    }, [integratedRaw, setLocalStorageIntegrated]);

    useEffect(() => {
        if (loading === false) {
            setLoadingState(false);
        }
    }, [loading]);

    return { integrated: integrated || false, loading: loadingState };
};
