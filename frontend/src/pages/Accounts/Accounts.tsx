import { useAuthContext } from '@authentication/AuthContext'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { USD } from '@dinero.js/currencies'
import {
	useGetAccountDetailsQuery,
	useGetAccountsLazyQuery,
} from '@graph/hooks'
import useLocalStorage from '@rehooks/local-storage'
import { useParams } from '@util/react-router/useParams'
import { Table } from 'antd'
import { dinero, toDecimal } from 'dinero.js'
import moment from 'moment'
import React, { useEffect } from 'react'
// @ts-expect-error
import { specific } from 'react-files-hooks'
import { Route, Routes, useNavigate } from 'react-router-dom'
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

const COLUMNS = [
	{
		title: 'ID',
		dataIndex: 'id',
		sorter: (a: { id: any }, b: { id: any }) => (a.id ?? 0) - (b.id ?? 0),
	},
	{
		title: 'Name',
		dataIndex: 'name',
		render: (
			value: any,
			record: {
				id: any
				name:
					| boolean
					| React.ReactElement<any>
					| number
					| string
					| Iterable<React.ReactNode>
					| React.ReactPortal
					| null
					| undefined
			},
		) => <a href={`/w/${record.id}/team`}>{record.name}</a>,
		sorter: (a: { name: any }, b: { name: any }) =>
			(a.name ?? '').localeCompare(b.name ?? ''),
	},
	{
		title: 'Email',
		dataIndex: 'email',
		sorter: (a: { email: any }, b: { email: any }) =>
			(a.email ?? '').localeCompare(b.email ?? ''),
	},
	{
		title: 'Stripe Customer ID',
		dataIndex: 'stripe_customer_id',
		render: (
			value:
				| boolean
				| React.ReactElement<any>
				| number
				| string
				| Iterable<React.ReactNode>
				| React.ReactPortal
				| null
				| undefined,
			record: { stripe_customer_id: any },
		) => (
			<a
				href={`https://dashboard.stripe.com/customers/${record.stripe_customer_id}`}
			>
				{value}
			</a>
		),
		sorter: (
			a: { stripe_customer_id: any },
			b: { stripe_customer_id: any },
		) =>
			(a.stripe_customer_id ?? '').localeCompare(
				b.stripe_customer_id ?? '',
			),
	},
	{
		title: 'Subscription Start',
		dataIndex: 'subscription_start',
		render: (value: moment.MomentInput) => moment(value).format('MM/DD/YY'),
		sorter: (
			a: { subscription_start: any },
			b: { subscription_start: any },
		) =>
			(a.subscription_start ?? '').localeCompare(
				b.subscription_start ?? '',
			),
	},
	{
		title: 'Plan Tier',
		dataIndex: 'plan_tier',
		sorter: (a: { plan_tier: any }, b: { plan_tier: any }) =>
			(a.plan_tier ?? '').localeCompare(b.plan_tier ?? ''),
	},
	{
		title: 'Session Limit',
		dataIndex: 'session_limit',
		sorter: (a: { session_limit: any }, b: { session_limit: any }) =>
			(a.session_limit ?? 0) - (b.session_limit ?? 0),
	},
	{
		title: 'Sessions This Month',
		dataIndex: 'session_count_cur',
		sorter: (
			a: { session_count_cur: any },
			b: { session_count_cur: any },
		) => (a.session_count_cur ?? 0) - (b.session_count_cur ?? 0),
	},
	{
		title: 'Viewed This Month',
		dataIndex: 'view_count_cur',
		sorter: (a: { view_count_cur: any }, b: { view_count_cur: any }) =>
			(a.view_count_cur ?? 0) - (b.view_count_cur ?? 0),
	},
	{
		title: 'Sessions Last Month',
		dataIndex: 'session_count_prev',
		sorter: (
			a: { session_count_prev: any },
			b: { session_count_prev: any },
		) => (a.session_count_prev ?? 0) - (b.session_count_prev ?? 0),
	},
	{
		title: 'Viewed Last Month',
		dataIndex: 'view_count_prev',
		sorter: (a: { view_count_prev: any }, b: { view_count_prev: any }) =>
			(a.view_count_prev ?? 0) - (b.view_count_prev ?? 0),
	},
	{
		title: 'Paid Last Month',
		dataIndex: 'paid_prev',
		render: (value: any) => {
			const baseAmount = dinero({
				amount: value,
				currency: USD,
			})
			return '$' + toDecimal(baseAmount)
		},
		sorter: (a: { paid_prev: any }, b: { paid_prev: any }) =>
			(a.paid_prev ?? 0) - (b.paid_prev ?? 0),
	},
	{
		title: 'Sessions Two Months Ago',
		dataIndex: 'session_count_prev_prev',
		sorter: (
			a: { session_count_prev_prev: any },
			b: { session_count_prev_prev: any },
		) =>
			(a.session_count_prev_prev ?? 0) - (b.session_count_prev_prev ?? 0),
	},
	{
		title: 'Paid Two Months Ago',
		dataIndex: 'paid_prev_prev',
		render: (value: any) => {
			const baseAmount = dinero({
				amount: value,
				currency: USD,
			})
			return '$' + toDecimal(baseAmount)
		},
		sorter: (a: { paid_prev_prev: any }, b: { paid_prev_prev: any }) =>
			(a.paid_prev_prev ?? 0) - (b.paid_prev_prev ?? 0),
	},
	{
		title: 'Member Count',
		dataIndex: 'member_count',
		sorter: (a: { member_count: any }, b: { member_count: any }) =>
			(a.member_count ?? 0) - (b.member_count ?? 0),
	},
	{
		title: 'Member Limit',
		dataIndex: 'member_limit',
		sorter: (a: { member_limit: any }, b: { member_limit: any }) =>
			(a.member_limit ?? 0) - (b.member_limit ?? 0),
	},
]

type Row = {
	id: any
	name?: any
	email?: any
	last_active?: any
}

export const AccountsPage = () => {
	const { setLoadingState } = useAppLoadingContext()
	const { isHighlightAdmin } = useAuthContext()

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	if (!isHighlightAdmin) {
		return null
	}

	return (
		<Routes>
			<Route path=":account_id" element={<Account />} />
			<Route path="*" element={<Accounts />} />
		</Routes>
	)
}

export const Account = () => {
	const { account_id } = useParams<{ account_id: string }>()
	const { data: accountData, loading } = useGetAccountDetailsQuery({
		variables: { workspace_id: account_id ?? '' },
		skip: !account_id,
	})
	console.log(accountData)
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
							(m) => ({ amt: m?.count, name: m?.name }),
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
							(m) => ({ amt: m?.count, name: m?.name }),
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
					<Table
						pagination={false}
						sticky={true}
						size="small"
						columns={[
							{
								title: 'ID',
								dataIndex: 'id',
								sorter: (a: Row, b: Row) =>
									(a.id ?? 0) - (b.id ?? 0),
							},
							{
								title: 'Name',
								dataIndex: 'name',
								sorter: (a: Row, b: Row) =>
									(a.name ?? '').localeCompare(b.name ?? ''),
							},
							{
								title: 'Email',
								dataIndex: 'email',
								sorter: (a: Row, b: Row) =>
									(a.email ?? '').localeCompare(
										b.email ?? '',
									),
							},
							{
								title: 'Last Active',
								dataIndex: 'last_active',
								render: (value: moment.MomentInput) =>
									moment(value).format('MM/DD/YY'),
								sorter: (a: Row, b: Row) =>
									(a.last_active ?? '').localeCompare(
										b.last_active ?? '',
									),
							},
						]}
						dataSource={accountData?.account_details.members}
					/>
				</>
			)}
		</ResponsiveContainer>
	)
}

export const Accounts = () => {
	const { download } = specific.useTextDownloader()

	const navigate = useNavigate()
	const [accountDataLocal, setAccountDataLocal] = useLocalStorage<
		{ [key: string]: any }[]
	>('accountData', [])
	const [getAccountsQuery, { loading }] = useGetAccountsLazyQuery({
		onCompleted: (data) => {
			const accounts: any[] | undefined =
				data?.accounts?.map((e) => e as any) ?? []
			setAccountDataLocal(accounts)
		},
	})
	return (
		<div style={{ padding: 50 }}>
			<button
				onClick={() => {
					getAccountsQuery()
				}}
			>
				refetch
			</button>
			<button
				onClick={() => {
					let dataStr = ''
					let rowStarted = false
					for (const c of COLUMNS) {
						if (rowStarted) {
							dataStr += ','
						}
						rowStarted = true
						dataStr += c.title
					}
					dataStr += '\n'

					for (const d of accountDataLocal) {
						let rowStarted = false
						for (const c of COLUMNS) {
							if (rowStarted) {
								dataStr += ','
							}
							rowStarted = true
							let v = (d[c.dataIndex] || '').toString() as string
							if (v.includes(',')) {
								v = v.replaceAll('"', '\\"')
								v = `"${v}"`
							}
							dataStr += v
						}
						dataStr += '\n'
					}

					download({
						data: dataStr,
						name: 'accounts.csv',
					})
				}}
			>
				download CSV
			</button>
			{loading ? (
				'loading...'
			) : (
				<Table
					pagination={false}
					sticky={true}
					onRow={(record) => {
						return {
							onClick: () => {
								navigate(`/accounts/${record.id}`)
							},
						}
					}}
					size="small"
					columns={COLUMNS}
					dataSource={
						accountDataLocal.map((a: any, i: any) => {
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
								view_count_cur: a?.view_count_cur,
								session_count_prev: a?.session_count_prev,
								view_count_prev: a?.view_count_prev,
								session_count_prev_prev:
									a?.session_count_prev_prev,
								session_limit: a?.session_limit,
								stripe_customer_id: a?.stripe_customer_id,
								subscription_start: a?.subscription_start,
							}
						}) ?? undefined
					}
				/>
			)}
		</div>
	)
}

export default Accounts
