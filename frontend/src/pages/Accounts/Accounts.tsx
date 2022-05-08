import {
    AppLoadingState,
    useAppLoadingContext,
} from '@context/AppLoadingContext';
import { USD } from '@dinero.js/currencies';
import useLocalStorage from '@rehooks/local-storage';
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
    useGetAccountsLazyQuery,
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
                        Stripe customer:{' '}
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
    const [accountDataLocal, setAccountDataLocal] = useLocalStorage(
        'accountData',
        JSON.stringify([])
    );
    const [
        getAccountsQuery,
        { data: accountQueryData, loading },
    ] = useGetAccountsLazyQuery({
        onCompleted: (data) => {
            setAccountDataLocal(JSON.stringify(data?.accounts));
        },
    });

    useEffect(() => {
        console.log(JSON.parse(accountDataLocal));
        if (!accountDataLocal && !loading) {
            getAccountsQuery();
        }
    }, [getAccountsQuery, accountDataLocal, loading]);

    return (
        <div style={{ padding: 50 }}>
            {loading ? (
                'loading...'
            ) : (
                <Table
                    pagination={false}
                    sticky={true}
                    onRow={(record) => {
                        return {
                            onClick: () => {
                                history.push(`/accounts/${record.id}`);
                            },
                        };
                    }}
                    size="small"
                    columns={[
                        {
                            title: 'Name',
                            dataIndex: 'name',
                            render: (value, record) => (
                                <a href={`/w/${record.id}/team`}>
                                    {record.name}
                                </a>
                            ),
                            sorter: (a, b) =>
                                (a.name ?? '').localeCompare(b.name ?? ''),
                        },
                        {
                            title: 'Email',
                            dataIndex: 'email',
                            sorter: (a, b) =>
                                (a.email ?? '').localeCompare(b.email ?? ''),
                        },
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
                            sorter: (a, b) =>
                                (a.stripe_customer_id ?? '').localeCompare(
                                    b.stripe_customer_id ?? ''
                                ),
                        },
                        {
                            title: 'Subscription Start',
                            dataIndex: 'subscription_start',
                            render: (value) => moment(value).format('MM/DD/YY'),
                            sorter: (a, b) =>
                                (a.subscription_start ?? '').localeCompare(
                                    b.subscription_start ?? ''
                                ),
                        },
                        {
                            title: 'Plan Tier',
                            dataIndex: 'plan_tier',
                            sorter: (a, b) =>
                                (a.plan_tier ?? '').localeCompare(
                                    b.plan_tier ?? ''
                                ),
                        },
                        {
                            title: 'Session Limit',
                            dataIndex: 'session_limit',
                            sorter: (a, b) =>
                                (a.session_limit ?? 0) - (b.session_limit ?? 0),
                        },
                        {
                            title: 'Sessions This Month',
                            dataIndex: 'session_count_cur',
                            sorter: (a, b) =>
                                (a.session_count_cur ?? 0) -
                                (b.session_count_cur ?? 0),
                        },
                        {
                            title: 'Sessions Last Month',
                            dataIndex: 'session_count_prev',
                            sorter: (a, b) =>
                                (a.session_count_prev ?? 0) -
                                (b.session_count_prev ?? 0),
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
                            sorter: (a, b) =>
                                (a.paid_prev ?? 0) - (b.paid_prev ?? 0),
                        },
                        {
                            title: 'Sessions Two Months Ago',
                            dataIndex: 'session_count_prev_prev',
                            sorter: (a, b) =>
                                (a.session_count_prev_prev ?? 0) -
                                (b.session_count_prev_prev ?? 0),
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
                            sorter: (a, b) =>
                                (a.paid_prev_prev ?? 0) -
                                (b.paid_prev_prev ?? 0),
                        },
                        {
                            title: 'Member Count',
                            dataIndex: 'member_count',
                            sorter: (a, b) =>
                                (a.member_count ?? 0) - (b.member_count ?? 0),
                        },
                        {
                            title: 'Member Limit',
                            dataIndex: 'member_limit',
                            sorter: (a, b) =>
                                (a.member_limit ?? 0) - (b.member_limit ?? 0),
                        },
                    ]}
                    dataSource={JSON.parse(accountDataLocal)?.map(
                        (a: any, i: any) => {
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
                                session_count_prev_prev:
                                    a?.session_count_prev_prev,
                                session_limit: a?.session_limit,
                                stripe_customer_id: a?.stripe_customer_id,
                                subscription_start: a?.subscription_start,
                            };
                        }
                    )}
                />
            )}
        </div>
    );
};

export default Accounts;
