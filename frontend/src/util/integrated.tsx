import useLocalStorage from '@rehooks/local-storage';
import { useParams } from '@util/react-router/useParams';
import { useEffect, useState } from 'react';

import { useAuthContext } from '../authentication/AuthContext';
import { useIsIntegratedLazyQuery } from '../graph/generated/hooks';

export const useIntegrated = (): { integrated: boolean; loading: boolean } => {
    const { isLoggedIn, isAuthLoading } = useAuthContext();
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
        if (!isLoggedIn) return;
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
    }, [integrated, localStorageIntegrated, query, isLoggedIn]);

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

    // Assume that app is integrated if viewing session as guest and not loading
    if (!isLoggedIn) {
        return { integrated: !isAuthLoading, loading: isAuthLoading };
    }

    return { integrated: integrated || false, loading: loadingState };
};
