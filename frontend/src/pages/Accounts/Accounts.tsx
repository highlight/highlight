import {
    AppLoadingState,
    useAppLoadingContext,
} from '@context/AppLoadingContext';
import { useParams } from '@util/react-router/useParams';
import { Table } from 'antd';
import React, { useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import {
    useGetAccountDetailsQuery,
    useGetAccountsQuery,
} from '../../graph/generated/hooks';

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
    const { data: accountData, loading } = useGetAccountDetailsQuery({
        variables: { workspace_id: account_id },
    });
    console.log(accountData);
    return (
        <ResponsiveContainer width="80%" height="50%">
            {loading ? (
                <div>loading</div>
            ) : (
                <>
                    <h1>Daily Session Count</h1>
                    <BarChart
                        width={1000}
                        height={300}
                        data={accountData?.account_details?.session_count_per_day?.map(
                            (m) => ({ amt: m?.count, name: m?.name })
                        )}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="amt" fill="#8884d8" />
                    </BarChart>
                    <h1>Monthly Session Count</h1>
                    <BarChart
                        width={1000}
                        height={300}
                        data={accountData?.account_details?.session_count_per_month?.map(
                            (m, i) => ({ amt: m?.count, name: m?.name })
                        )}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="amt" fill="#8884d8" />
                    </BarChart>
                </>
            )}
        </ResponsiveContainer>
    );
};

export const Accounts = () => {
    const history = useHistory();
    const { data: accountData, loading } = useGetAccountsQuery();

    return (
        <div style={{ padding: 50 }}>
            {loading ? (
                'loading...'
            ) : (
                <Table
                    pagination={false}
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
