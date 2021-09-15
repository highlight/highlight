import React, { useRef } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { GetErrorGroupQuery } from '../../../../../../graph/generated/operations';
import { Session } from '../../../../../../graph/generated/schemas';
import { PlayerSearchParameters } from '../../../../../Player/PlayerHook/utils';
import MinimalSessionCard from '../../../../../Sessions/SessionsFeedV2/components/MinimalSessionCard/MinimalSessionCard';

interface Props {
    errorGroup?: GetErrorGroupQuery;
}

const ErrorSessionList = ({ errorGroup }: Props) => {
    const virtuoso = useRef<VirtuosoHandle>(null);

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
                            id: session?.session_id,
                            created_at: session?.timestamp,
                            identifier: session?.identifier,
                            fingerprint: session?.fingerprint,
                            browser_name: session?.browser,
                            os_name: session?.os,
                            environment: session?.environment || 'Production',
                        } as Partial<Session>) as Session
                    }
                    selected={false}
                    key={`${session?.session_id}-${index}`}
                    errorVersion
                    showDetailedViewOverride
                    urlParams={`?${PlayerSearchParameters.errorId}=${session?.error_id}`}
                />
            )}
        />
    );
};

export default ErrorSessionList;
