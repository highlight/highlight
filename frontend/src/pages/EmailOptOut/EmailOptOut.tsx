import { Header } from '@components/Header/Header'
import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import Switch from '@components/Switch/Switch'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { namedOperations } from '@graph/operations'
import { EmailOptOutCategory } from '@graph/schemas'
import { ApplicationContextProvider } from '@routers/OrgRouter/ApplicationContext'
import { GlobalContextProvider } from '@routers/OrgRouter/context/GlobalContext'
import { message } from 'antd'
import { H } from 'highlight.run'
import { useEffect } from 'react'
import { StringParam, useQueryParams } from 'use-query-params'

import {
	useGetEmailOptOutsQuery,
	useUpdateEmailOptOutMutation,
} from '../../graph/generated/hooks'
import styles from './EmailOptOut.module.scss'

const OptInRow = (
	label: string,
	info: string | undefined,
	checked: boolean,
	setState: (n: boolean) => void,
	disabled: boolean,
) => {
	return (
		<Switch
			key={label}
			label={
				<>
					{label}
					{info && <InfoTooltip size="medium" title={info} />}
				</>
			}
			trackingId={`switch-${label}`}
			checked={checked}
			onChange={setState}
			disabled={disabled}
		/>
	)
}

export const EmailOptOutPage = () => {
	const [{ admin_id, token }] = useQueryParams({
		admin_id: StringParam,
		token: StringParam,
	})

	const { data, loading, error } = useGetEmailOptOutsQuery({
		variables: { token: token ?? '', admin_id: admin_id ?? '' },
		skip: !token || !admin_id,
	})

	const [updateEmailOptOut] = useUpdateEmailOptOutMutation({
		refetchQueries: [namedOperations.Query.GetEmailOptOuts],
	})

	const { setLoadingState } = useAppLoadingContext()
	useEffect(() => {
		if (!loading) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [loading, setLoadingState])

	let innerContent
	if (loading) {
		innerContent = null
	} else if (error) {
		innerContent = (
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

		innerContent = (
			<>
				<h1>Email Settings</h1>
				<p>I would like to receive the following emails:</p>
				{categories.map((c) =>
					OptInRow(
						c.label,
						c.info,
						!optOuts.has(c.type),
						(isOptIn: boolean) => {
							updateEmailOptOut({
								variables: {
									token: token ?? '',
									admin_id: admin_id ?? '',
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
			</>
		)
	}

	return (
		<ApplicationContextProvider
			value={{
				currentProject: undefined,
				allProjects: [],
				currentWorkspace: undefined,
				workspaces: [],
			}}
		>
			<GlobalContextProvider
				value={{
					showKeyboardShortcutsGuide: false,
					toggleShowKeyboardShortcutsGuide: () => {},
					showBanner: false,
					toggleShowBanner: () => {},
				}}
			>
				<div>
					<Header />
					<div className={styles.contentContainer}>
						{innerContent}
					</div>
				</div>
			</GlobalContextProvider>
		</ApplicationContextProvider>
	)
}
