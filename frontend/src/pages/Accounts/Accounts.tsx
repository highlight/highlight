import {
    AppLoadingState,
    useAppLoadingContext,
} from '@context/AppLoadingContext';
import { Table } from 'antd';
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
        <div style={{ padding: 50 }}>
            {loading ? (
                'loading...'
            ) : (
                <Table
                    columns={[
                        { title: 'Name', dataIndex: 'name' },
                        { title: 'ID', dataIndex: 'id' },
                        {
                            title: 'Last Month Count',
                            dataIndex: 'session_count',
                        },
                    ]}
                    dataSource={accountData?.accounts?.map((a, i) => {
                        return {
                            key: i,
                            name: a?.name,
                            id: a?.id,
                            session_count: a?.session_count,
                        };
                    })}
                />
            )}
        </div>
    );
};

export default Accounts;
