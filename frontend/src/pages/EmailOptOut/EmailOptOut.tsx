import { toast } from '@components/Toaster'
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
import { Heading, Stack, Text } from '@highlight-run/ui/components'
import { GlobalContextProvider } from '@routers/ProjectRouter/context/GlobalContext'
import { useEffect } from 'react'
import { StringParam, useQueryParams } from 'use-query-params'

import BorderBox from '@/components/BorderBox/BorderBox'
import { Header } from '@/components/Header/Header'
import LeadAlignLayout from '@/components/layout/LeadAlignLayout'
import { ToggleRow } from '@/components/ToggleRow/ToggleRow'

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
					Please reach out to us if you have any questions or need
					assistance.
				</p>
			</>
		)
	} else {
		const general = [
			{
				label: 'Billing',
				info: 'Notifications about billing and plan usage',
				type: EmailOptOutCategory.Billing,
			},
		]
		const digests = [
			{
				label: 'Project Overview',
				info: 'Weekly summaries of user activity and errors for your projects',
				type: EmailOptOutCategory.Digests,
			},
			{
				label: 'Session Insights',
				info: 'Weekly summaries of your most interesting sessions',
				type: EmailOptOutCategory.SessionDigests,
			},
		]
		const categories = [...general, ...digests]

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
					{general.map((c) => (
						<BorderBox key={c.label}>
							{ToggleRow(
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
											toast.success(
												`Opted ${
													isOptIn ? 'in to' : 'out of'
												} ${c.type} emails.`,
											)
										})
										.catch((reason: any) => {
											toast.error(String(reason))
										})
								},
								optOutAll,
							)}
						</BorderBox>
					))}
				</Stack>
				<Stack gap="12" direction="column" paddingTop="24">
					<Text weight="bold" size="small" color="default">
						Digests
					</Text>
					{digests.map((c) => (
						<BorderBox key={c.label}>
							{ToggleRow(
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
											toast.success(
												`Opted ${
													isOptIn ? 'in to' : 'out of'
												} ${c.type} emails.`,
											)
										})
										.catch((reason: any) => {
											toast.error(String(reason))
										})
								},
								optOutAll,
							)}
						</BorderBox>
					))}
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

	return (
		<GlobalContextProvider
			value={{
				showKeyboardShortcutsGuide: false,
				toggleShowKeyboardShortcutsGuide: () => {},
				showBanner: false,
				toggleShowBanner: () => {},
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
