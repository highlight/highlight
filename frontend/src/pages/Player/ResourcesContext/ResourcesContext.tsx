import { useGetResourcesQuery } from '@graph/hooks';
import { useParams } from '@util/react-router/useParams';
import { useCallback, useEffect, useState } from 'react';

import { createContext } from '../../../util/context/context';

interface ResourcesContext {
    resourcesLoading: boolean;
    loadResources: () => void;
    resources: Array<PerformanceResourceTiming & { id: number }>;
}

export const useResources = (): ResourcesContext => {
    const { session_secure_id } = useParams<{ session_secure_id: string }>();
    const [sessionSecureId, setSessionSecureId] = useState<string>();

    const { data, loading: resourcesLoading } = useGetResourcesQuery({
        fetchPolicy: 'no-cache',
        variables: {
            session_secure_id: sessionSecureId! ?? '',
        },
        skip: sessionSecureId === undefined,
    });

    const [resources, setResources] = useState<
        Array<PerformanceResourceTiming & { id: number }>
    >([]);
    useEffect(() => {
        setResources(
            (
                data?.resources?.map((r, i) => {
                    return { ...r, id: i };
                }) ?? []
            ).sort((a, b) => a.startTime - b.startTime)
        );
    }, [data?.resources]);

    const loadResources = useCallback(() => {
        setSessionSecureId(session_secure_id);
    }, [session_secure_id]);

    return {
        loadResources,
        resources,
        resourcesLoading,
    };
};

export const [
    useResourcesContext,
    ResourcesContextProvider,
] = createContext<ResourcesContext>('Resources');
