import Switch from '@components/Switch/Switch'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import {
	useGetEmailOptOutsQuery,
	useUpdateEmailOptOutMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { EmailOptOutCategory } from '@graph/schemas'
import { Box, Heading, Stack, Text } from '@highlight-run/ui'
import { GlobalContextProvider } from '@routers/ProjectRouter/context/GlobalContext'
import { message } from 'antd'
import { useDialogState } from 'ariakit/dialog'
import { H } from 'highlight.run'
import { useEffect } from 'react'
import { StringParam, useQueryParams } from 'use-query-params'

import { Header } from '@/components/Header/Header'
import LeadAlignLayout from '@/components/layout/LeadAlignLayout'

const OptInRow = (
	label: string,
	info: string | undefined,
	checked: boolean,
	setState: (n: boolean) => void,
	disabled: boolean,
) => {
	return (
		<Box
			border="dividerWeak"
			borderRadius="8"
			p="8"
			pr="12"
			display="flex"
			justifyContent="space-between"
			alignItems="center"
			key={label}
		>
			<Stack gap="8" direction="column" my="6">
				<Text weight="bold" size="small" color="strong">
					{label}
				</Text>
				{info && <Text color="moderate">{info}</Text>}
			</Stack>
			<Switch
				trackingId={`switch-${label}`}
				checked={checked}
				onChange={setState}
				disabled={disabled}
				size="default"
			/>
		</Box>
	)
}

type Props = {
	token?: string | null
	admin_id?: string | null
}

export const EmailOptOutPanel = ({ token, admin_id }: Props) => {
	const [updateEmailOptOut] = useUpdateEmailOptOutMutation({
		refetchQueries: [namedOperations.Query.GetEmailOptOuts],
	})

	const { data, loading, error } = useGetEmailOptOutsQuery({
		variables: { token, admin_id },
	})

	const { setLoadingState } = useAppLoadingContext()
	useEffect(() => {
		if (!loading) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [loading, setLoadingState])

	if (loading) {
		return null
	} else if (error) {
		return (
			<>
				<p>Link is invalid or has expired.</p>
				<p>
					Please reach out to us on{' '}
					<a
						onClick={async () => {
							const sessionId = await H.getSessionURL()

							window.Intercom('boot', {
								app_id: 'gm6369ty',
								alignment: 'right',
								hide_default_launcher: true,
								sessionId,
							})
							window.Intercom('showNewMessage')
						}}
					>
						Intercom
					</a>{' '}
					or email{' '}
					<a href="mailto:support@highlight.io">
						support@highlight.io
					</a>
					.
				</p>
			</>
		)
	} else {
		const categories = [
			{
				label: 'Digests',
				info: 'Weekly summaries of user activity and errors for your projects',
				type: EmailOptOutCategory.Digests,
			},
			{
				label: 'Billing',
				info: 'Notifications about billing and plan usage',
				type: EmailOptOutCategory.Billing,
			},
		]

		let optOutAll = false
		const optOuts = new Set<EmailOptOutCategory>()
		for (const o of data?.email_opt_outs ?? []) {
			if (o === EmailOptOutCategory.All) {
				optOutAll = true
				for (const c of categories) {
					optOuts.add(c.type)
				}
			} else {
				optOuts.add(o)
			}
		}

		return (
			<Stack gap="24" direction="column">
				<Heading mt="16" level="h4">
					Notifications
				</Heading>
				<Stack gap="12" direction="column">
					{categories.map((c) =>
						OptInRow(
							c.label,
							c.info,
							!optOuts.has(c.type),
							(isOptIn: boolean) => {
								updateEmailOptOut({
									variables: {
										token,
										admin_id,
										category: c.type,
										is_opt_out: !isOptIn,
									},
								})
									.then(() => {
										message.success(
											`Opted ${
												isOptIn ? 'in to' : 'out of'
											} ${c.type} emails.`,
										)
									})
									.catch((reason: any) => {
										message.error(String(reason))
									})
							},
							optOutAll,
						),
					)}
				</Stack>
			</Stack>
		)
	}
}

export const EmailOptOutPage = () => {
	const [{ admin_id, token }] = useQueryParams({
		admin_id: StringParam,
		token: StringParam,
	})

	const commandBarDialog = useDialogState()

	return (
		<GlobalContextProvider
			value={{
				showKeyboardShortcutsGuide: false,
				toggleShowKeyboardShortcutsGuide: () => {},
				showBanner: false,
				toggleShowBanner: () => {},
				commandBarDialog,
			}}
		>
			<Header />
			<LeadAlignLayout>
				<h1>Email Settings</h1>
				<EmailOptOutPanel token={token} admin_id={admin_id} />
			</LeadAlignLayout>
		</GlobalContextProvider>
	)
}
