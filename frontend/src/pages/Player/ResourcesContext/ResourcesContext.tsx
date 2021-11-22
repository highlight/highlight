import { useAuthContext } from '@authentication/AuthContext';
import { useGetResourcesQuery } from '@graph/hooks';
import { Session } from '@graph/schemas';
import { useParams } from '@util/react-router/useParams';
import { H } from 'highlight.run';
import { useCallback, useEffect, useState } from 'react';

import { createContext } from '../../../util/context/context';

interface ResourcesContext {
    resourcesLoading: boolean;
    loadResources: () => void;
    resources: Array<PerformanceResourceTiming & { id: number }>;
}

export const useResources = (
    session: Session | undefined
): ResourcesContext => {
    const { session_secure_id } = useParams<{ session_secure_id: string }>();
    const [sessionSecureId, setSessionSecureId] = useState<string>();
    const { isHighlightAdmin } = useAuthContext();

    const { data, loading: resourcesLoading } = useGetResourcesQuery({
        fetchPolicy: 'no-cache',
        variables: {
            session_secure_id: sessionSecureId! ?? '',
        },
        skip:
            sessionSecureId === undefined ||
            session === undefined ||
            (!!session.resources_url && isHighlightAdmin),
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

    // If sessionSecureId is set and equals the current session's (ensures effect is run once)
    // and resources url is defined, fetch using resources url
    useEffect(() => {
        if (
            sessionSecureId === session?.secure_id &&
            !!session?.resources_url &&
            isHighlightAdmin
        ) {
            fetch(session?.resources_url)
                .then((response) => response.json())
                .then((data) => {
                    setResources(
                        (
                            (data as any[] | undefined)?.map((r, i) => {
                                return { ...r, id: i };
                            }) ?? []
                        ).sort((a, b) => a.startTime - b.startTime)
                    );
                })
                .catch((e) => {
                    setResources([]);
                    H.consumeError(e, 'Error direct downloading resources');
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionSecureId, session?.secure_id]);

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
