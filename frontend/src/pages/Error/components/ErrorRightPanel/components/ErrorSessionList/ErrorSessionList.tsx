import { useAuthContext } from '@authentication/AuthContext';
import {
    DEMO_WORKSPACE_APPLICATION_ID,
    DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton';
import { Virtuoso, VirtuosoHandle } from '@highlight-run/react-virtuoso';
import { useParams } from '@util/react-router/useParams';
import React, { useRef } from 'react';

import { GetErrorGroupQuery } from '../../../../../../graph/generated/operations';
import { Session } from '../../../../../../graph/generated/schemas';
import { PlayerSearchParameters } from '../../../../../Player/PlayerHook/utils';
import MinimalSessionCard from '../../../../../Sessions/SessionsFeedV2/components/MinimalSessionCard/MinimalSessionCard';

interface Props {
    errorGroup?: GetErrorGroupQuery;
}

const ErrorSessionList = ({ errorGroup }: Props) => {
    const virtuoso = useRef<VirtuosoHandle>(null);
    const { isLoggedIn } = useAuthContext();
    const { project_id } = useParams<{ project_id: string }>();
    const projectIdRemapped =
        project_id === DEMO_WORKSPACE_APPLICATION_ID
            ? DEMO_WORKSPACE_PROXY_APPLICATION_ID
            : project_id;

    if (!errorGroup?.error_group?.metadata_log) {
        return null;
    }

    return (
        <Virtuoso
            ref={virtuoso}
            overscan={500}
            data={errorGroup.error_group.metadata_log}
            itemContent={(index, session) => (
                <MinimalSessionCard
                    session={
                        ({
                            secure_id: session?.session_secure_id,
                            created_at: session?.timestamp,
                            identifier: session?.identifier,
                            fingerprint: session?.fingerprint,
                            browser_name: session?.browser,
                            os_name: session?.os,
                            environment: session?.environment || 'Production',
                            user_properties: session?.user_properties || {},
                        } as Partial<Session>) as Session
                    }
                    selected={false}
                    key={`${session?.session_secure_id}-${index}`}
                    errorVersion
                    showDetailedViewOverride
                    urlParams={`?${PlayerSearchParameters.errorId}=${session?.error_id}`}
                    linkDisabled={
                        !isLoggedIn &&
                        projectIdRemapped !==
                            DEMO_WORKSPACE_PROXY_APPLICATION_ID
                    }
                    configuration={{
                        datetimeFormat: 'Relative',
                        countFormat: 'Short',
                    }}
                />
            )}
        />
    );
};

export default ErrorSessionList;
