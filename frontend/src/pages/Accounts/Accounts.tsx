import {
    AppLoadingState,
    useAppLoadingContext,
} from '@context/AppLoadingContext';
import { USD } from '@dinero.js/currencies';
import { useParams } from '@util/react-router/useParams';
import { Table } from 'antd';
import { dinero, down, toUnit } from 'dinero.js';
import moment from 'moment';
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
                    <h1>
                        <a href={`/w/${account_id}/team`}>
                            {accountData?.account_details?.name}
                        </a>
                    </h1>
                    <h1>
                        Stripe customer:
                        <a
                            href={`https://dashboard.stripe.com/customers/${accountData?.account_details?.stripe_customer_id}`}
                        >
                            {accountData?.account_details?.stripe_customer_id}
                        </a>
                    </h1>
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
                        {
                            title: 'Name',
                            dataIndex: 'name',
                            render: (value, record) => (
                                <a href={`/w/${record.id}/team`}>
                                    {record.name}
                                </a>
                            ),
                        },
                        { title: 'Email', dataIndex: 'email' },
                        {
                            title: 'Stripe Customer ID',
                            dataIndex: 'stripe_customer_id',
                            render: (value, record) => (
                                <a
                                    href={`https://dashboard.stripe.com/customers/${record.stripe_customer_id}`}
                                >
                                    {value}
                                </a>
                            ),
                        },
                        {
                            title: 'Subscription Start',
                            dataIndex: 'subscription_start',
                            render: (value) => moment(value).format('MM/DD/YY'),
                        },
                        { title: 'Plan Tier', dataIndex: 'plan_tier' },
                        { title: 'Session Limit', dataIndex: 'session_limit' },
                        {
                            title: 'Sessions This Month',
                            dataIndex: 'session_count_cur',
                        },
                        {
                            title: 'Sessions Last Month',
                            dataIndex: 'session_count_prev',
                        },
                        {
                            title: 'Paid Last Month',
                            dataIndex: 'paid_prev',
                            render: (value) => {
                                const baseAmount = dinero({
                                    amount: value,
                                    currency: USD,
                                });
                                return (
                                    '$' +
                                    toUnit(baseAmount, {
                                        digits: 2,
                                        round: down,
                                    })
                                );
                            },
                        },
                        {
                            title: 'Sessions Two Months Ago',
                            dataIndex: 'session_count_prev_prev',
                        },
                        {
                            title: 'Paid Two Months Ago',
                            dataIndex: 'paid_prev_prev',
                            render: (value) => {
                                const baseAmount = dinero({
                                    amount: value,
                                    currency: USD,
                                });
                                return (
                                    '$' +
                                    toUnit(baseAmount, {
                                        digits: 2,
                                        round: down,
                                    })
                                );
                            },
                        },
                        {
                            title: 'Member Count',
                            dataIndex: 'member_count',
                        },
                        {
                            title: 'Member Limit',
                            dataIndex: 'member_limit',
                        },
                    ]}
                    dataSource={accountData?.accounts?.map((a, i) => {
                        return {
                            key: i,
                            email: a?.email,
                            id: a?.id,
                            member_count: a?.member_count,
                            member_limit: a?.member_limit,
                            name: a?.name,
                            plan_tier: a?.plan_tier,
                            paid_prev: a?.paid_prev,
                            paid_prev_prev: a?.paid_prev_prev,
                            session_count_cur: a?.session_count_cur,
                            session_count_prev: a?.session_count_prev,
                            session_count_prev_prev: a?.session_count_prev_prev,
                            session_limit: a?.session_limit,
                            stripe_customer_id: a?.stripe_customer_id,
                            subscription_start: a?.subscription_start,
                        };
                    })}
                />
            )}
        </div>
    );
};

export default Accounts;
