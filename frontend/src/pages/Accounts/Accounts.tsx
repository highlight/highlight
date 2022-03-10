import {
    AppLoadingState,
    useAppLoadingContext,
} from '@context/AppLoadingContext';
import { useParams } from '@util/react-router/useParams';
import { Table } from 'antd';
import React, { useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';

import { useGetAccountsQuery } from '../../graph/generated/hooks';

export const AccountsPage = () => {
    const { setLoadingState } = useAppLoadingContext();

    useEffect(() => {
        setLoadingState(AppLoadingState.LOADED);
    }, [setLoadingState]);

    return (
        <Switch>
            <Route path="/accounts/:account_id">
                <Account />
            </Route>
            <Route path="/accounts">
                <Accounts />
            </Route>
        </Switch>
    );
};

export const Account = () => {
    const { account_id } = useParams<{ account_id: string }>();
    return <div>{account_id}</div>;
};

export const Accounts = () => {
    const history = useHistory();
    const { data: accountData, loading } = useGetAccountsQuery({
        fetchPolicy: 'network-only',
    });

    return (
        <div style={{ padding: 50 }}>
            {loading ? (
                'loading...'
            ) : (
                <Table
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                history.push(`/accounts/${record.id}`);
                            },
                        };
                    }}
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
