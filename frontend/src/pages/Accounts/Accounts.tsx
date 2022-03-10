import {
    AppLoadingState,
    useAppLoadingContext,
} from '@context/AppLoadingContext';
import React, { useEffect } from 'react';

import { useGetAccountsQuery } from '../../graph/generated/hooks';

export const Accounts = () => {
    const { setLoadingState } = useAppLoadingContext();
    const { data: accountData, loading } = useGetAccountsQuery({
        fetchPolicy: 'network-only',
    });

    useEffect(() => {
        setLoadingState(AppLoadingState.LOADED);
    }, [setLoadingState]);

    return (
        <div>
            {loading ? (
                'loading...'
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>ID</th>
                            <th>Last Month Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accountData?.accounts?.map((a, i) => (
                            <tr key={i}>
                                <td>{a?.name}</td>
                                <td>{a?.id}</td>
                                <td>{a?.session_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Accounts;
