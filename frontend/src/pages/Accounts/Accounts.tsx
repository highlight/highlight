/** @jsxImportSource react */
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
// Replaced antd Table with Highlight UI components
import {
	Box,
	Table,
	Text,
	Button,
	IconSolidDownload,
	IconSolidRefresh,
} from '@highlight-run/ui/components'
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
	{ title: 'ID', dataIndex: 'id' },
	{ title: 'Name', dataIndex: 'name' },
	{ title: 'Email', dataIndex: 'email' },
	{ title: 'Stripe Customer ID', dataIndex: 'stripe_customer_id' },
	{ title: 'Subscription Start', dataIndex: 'subscription_start' },
	{ title: 'Plan Tier', dataIndex: 'plan_tier' },
	{ title: 'Session Limit', dataIndex: 'session_limit' },
	{ title: 'Sessions This Month', dataIndex: 'session_count_cur' },
	{ title: 'Viewed This Month', dataIndex: 'view_count_cur' },
	{ title: 'Sessions Last Month', dataIndex: 'session_count_prev' },
	{ title: 'Viewed Last Month', dataIndex: 'view_count_prev' },
	{ title: 'Paid Last Month', dataIndex: 'paid_prev' },
	{ title: 'Sessions Two Months Ago', dataIndex: 'session_count_prev_prev' },
	{ title: 'Paid Two Months Ago', dataIndex: 'paid_prev_prev' },
	{ title: 'Member Count', dataIndex: 'member_count' },
	{ title: 'Member Limit', dataIndex: 'member_limit' },
]

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

	return (
		<Box p="32" width="full">
			{loading ? (
				<Text>Loading...</Text>
			) : (
				<>
					<Box mb="16">
						<Text size="large" weight="bold">
							<a href={`/w/${account_id}/team`}>
								{accountData?.account_details?.name}
							</a>
						</Text>
						<Text color="weak">
							Stripe customer:{' '}
							<a
								href={`https://dashboard.stripe.com/customers/${accountData?.account_details?.stripe_customer_id}`}
								target="_blank"
								rel="noreferrer"
							>
								{
									accountData?.account_details
										?.stripe_customer_id
								}
							</a>
						</Text>
					</Box>

					<Box my="24">
						<Text weight="bold">Daily Session Count</Text>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart
								data={accountData?.account_details?.session_count_per_day?.map(
									(m) => ({ amt: m?.count, name: m?.name }),
								)}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar dataKey="amt" fill="#8884d8" />
							</BarChart>
						</ResponsiveContainer>
					</Box>

					<Box my="24">
						<Text weight="bold">Monthly Session Count</Text>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart
								data={accountData?.account_details?.session_count_per_month?.map(
									(m) => ({ amt: m?.count, name: m?.name }),
								)}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar dataKey="amt" fill="#8884d8" />
							</BarChart>
						</ResponsiveContainer>
					</Box>

					<Table>
						<Table.Head>
							<Table.Row>
								<Table.Header>ID</Table.Header>
								<Table.Header>Name</Table.Header>
								<Table.Header>Email</Table.Header>
								<Table.Header>Last Active</Table.Header>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{accountData?.account_details.members.map(
								(member: any) => (
									<Table.Row key={member.id}>
										<Table.Cell>{member.id}</Table.Cell>
										<Table.Cell>{member.name}</Table.Cell>
										<Table.Cell>{member.email}</Table.Cell>
										<Table.Cell>
											{moment(member.last_active).format(
												'MM/DD/YY',
											)}
										</Table.Cell>
									</Table.Row>
								),
							)}
						</Table.Body>
					</Table>
				</>
			)}
		</Box>
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
			const accounts = data?.accounts?.map((e) => e as any) ?? []
			setAccountDataLocal(accounts)
		},
	})

	return (
		<Box p="32">
			<Box display="flex" gap="8" mb="16">
				<Button
					kind="secondary"
					size="small"
					onClick={() => getAccountsQuery()}
					iconLeft={<IconSolidRefresh size={14} />}
				>
					Refetch
				</Button>
				<Button
					kind="secondary"
					size="small"
					onClick={() => {
						let dataStr =
							COLUMNS.map((c) => c.title).join(',') + '\n'
						accountDataLocal.forEach((d) => {
							dataStr +=
								COLUMNS.map((c) => {
									const v = (d[c.dataIndex] || '').toString()
									return v.includes(',')
										? `"${v.replaceAll('"', '\\"')}"`
										: v
								}).join(',') + '\n'
						})
						download({ data: dataStr, name: 'accounts.csv' })
					}}
					iconLeft={<IconSolidDownload size={14} />}
				>
					Download CSV
				</Button>
			</Box>

			{loading ? (
				<Text>Loading...</Text>
			) : (
				<Table>
					<Table.Head>
						<Table.Row>
							{COLUMNS.map((col) => (
								<Table.Header key={col.dataIndex}>
									{col.title}
								</Table.Header>
							))}
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{accountDataLocal.map((a: any) => (
							<Table.Row
								key={a.id}
								onClick={() => navigate(`/accounts/${a.id}`)}
							>
								<Table.Cell>{a.id}</Table.Cell>
								<Table.Cell>
									<a
										href={`/w/${a.id}/team`}
										onClick={(e) => e.stopPropagation()}
									>
										{a.name}
									</a>
								</Table.Cell>
								<Table.Cell>{a.email}</Table.Cell>
								<Table.Cell>
									<a
										href={`https://dashboard.stripe.com/customers/${a.stripe_customer_id}`}
										target="_blank"
										rel="noreferrer"
										onClick={(e) => e.stopPropagation()}
									>
										{a.stripe_customer_id}
									</a>
								</Table.Cell>
								<Table.Cell>
									{moment(a.subscription_start).format(
										'MM/DD/YY',
									)}
								</Table.Cell>
								<Table.Cell>{a.plan_tier}</Table.Cell>
								<Table.Cell>{a.session_limit}</Table.Cell>
								<Table.Cell>{a.session_count_cur}</Table.Cell>
								<Table.Cell>{a.view_count_cur}</Table.Cell>
								<Table.Cell>{a.session_count_prev}</Table.Cell>
								<Table.Cell>{a.view_count_prev}</Table.Cell>
								<Table.Cell>
									{'$' +
										toDecimal(
											dinero({
												amount: a.paid_prev || 0,
												currency: USD,
											}),
										)}
								</Table.Cell>
								<Table.Cell>
									{a.session_count_prev_prev}
								</Table.Cell>
								<Table.Cell>
									{'$' +
										toDecimal(
											dinero({
												amount: a.paid_prev_prev || 0,
												currency: USD,
											}),
										)}
								</Table.Cell>
								<Table.Cell>{a.member_count}</Table.Cell>
								<Table.Cell>{a.member_limit}</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table>
			)}
		</Box>
	)
}

export default Accounts
