import { useAppLoadingContext } from '@context/AppLoadingContext';
import React, { useEffect } from 'react';

import { useGetAccountsQuery } from '../../graph/generated/hooks';

export const Accounts = () => {
    const { setIsLoading } = useAppLoadingContext();
    const { data: accountData } = useGetAccountsQuery({
        fetchPolicy: 'network-only',
    });

    useEffect(() => {
        setIsLoading(false);
    }, [setIsLoading]);

    return (
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
    );
};

export default Accounts;
