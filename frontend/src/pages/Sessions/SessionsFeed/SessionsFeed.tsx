import { useLazyQuery } from '@apollo/client';
import React from 'react';

export const SessionFeed = () => {
    const [getSessions, { loading, error, data }] = useLazyQuery<
        { sessions: any[] },
        { count: number; organization_id: number; params: SearchParam[] }
    >(
        gql`
    query GetSessions(
        $organization_id: ID!
        $count: Int!
        $params: [Any]
    ) {
        sessions(
            organization_id: $organization_id
            count: $count
            params: $params
        ) {
            id
            user_id
            identifier
            os_name
            browser_name
            browser_version
            city
            state
            postal
            created_at
            length
        }
    }
`,
        {
            pollInterval: 5000,
        }
    );
    return <div>hello</div>
}