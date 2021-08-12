import React, { useRef } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import { GetErrorGroupQuery } from '../../../../../../graph/generated/operations';
import { Session } from '../../../../../../graph/generated/schemas';
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
            itemContent={(index, session: any) => (
                <MinimalSessionCard
                    session={
                        ({
                            id: session?.session_id,
                            created_at: session?.timestamp,
                            identifier: session?.visited_url,
                            browser_name: session?.browser,
                            os_name: session?.os,
                        } as Partial<Session>) as Session
                    }
                    selected={false}
                    key={`${session?.session_id}-${index}`}
                    errorVersion
                    showDetailedViewOverride
                />
            )}
        />
    );
};

export default ErrorSessionList;
