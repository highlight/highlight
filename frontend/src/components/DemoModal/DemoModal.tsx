import { useAuthContext } from '@authentication/AuthContext'
import { Button } from '@components/Button'
import {
	Box,
	Form,
	IconSolidExclamation,
	Text,
} from '@highlight-run/ui/components'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import { getAttributionData } from '@util/attribution'
import { Divider } from 'antd'
import React from 'react'
import { Helmet } from 'react-helmet'

export const DemoModal = () => {
	const { isAuthLoading, isLoggedIn } = useAuthContext()
	const [error, setError] = React.useState<string>()
	const [visible, setVisible] = useLocalStorage<boolean>(
		'highlight-demo-email-modal-visible',
		true,
	)
	const formStore = Form.useStore({
		defaultValues: {
			email: '',
		},
	})
	const email = formStore.useValue('email')
	const onSubmit = async () => {
		if (!(await formStore.validate())) {
			return
		}
		const badEmailStrings = [
			'gmail',
			'yahoo',
			'hotmail',
			'work',
			'mysite',
			'outlook',
			'thanks.com',
			'icloud',
			'live',
			'aol',
			'protonmail',
			'zoho',
		]
		if (
			badEmailStrings.some((badEmailString) =>
				email.includes(badEmailString),
			)
		) {
			setError('Please use your work email')
			return
		}
		let attribution = getAttributionData()
		try {
			const parsedReferral = JSON.parse(attribution.referral)
			attribution = { ...attribution, ...parsedReferral }
		} catch (e) {}
		analytics.identify(email, {
			// hubspot attribute to trigger sequence for this contact
			demo_sign_up: true,
			referral_url: window.location.href.split('?')[0],
			event: 'demo-email-submit',
			...attribution,
		})
		analytics.track('demo-email-submit', { email, ...attribution })
		setVisible(false)
	}

	if (isAuthLoading || isLoggedIn) return null

	return visible ? (
		<>
			<Helmet>
				<title>Highlight.io Demo</title>
			</Helmet>
			<Box
				width="screen"
				display="flex"
				height="screen"
				position="fixed"
				alignItems="flex-start"
				justifyContent="center"
				style={{
					zIndex: '30000',
					overflow: 'hidden',
					backgroundColor: '#6F6E777A',
				}}
			>
				<Box
					display="flex"
					borderRadius="8"
					border="secondary"
					style={{
						marginTop: 'auto',
						marginBottom: 'auto',
						maxWidth: '324px',
					}}
					backgroundColor="white"
				>
					<Form store={formStore} onSubmit={onSubmit}>
						<Box
							p="10"
							display="flex"
							alignItems="center"
							justifyContent="space-between"
						>
							<Text color="n11">
								Enter your email to view the demo
							</Text>
						</Box>
						<Divider className="m-0" />
						<Box
							p="10"
							gap="10"
							display="flex"
							flexDirection="column"
						>
							<Form.Input
								focusable
								name={formStore.names.email}
								type="email"
								autoComplete="email"
								required
								rounded
								placeholder="Work Email"
							/>
						</Box>
						<Box
							my="0"
							p="4"
							gap="4"
							display="flex"
							borderRadius="8"
							alignItems="center"
							backgroundColor="raised"
							justifyContent="flex-end"
							mt="0"
						>
							{error ? (
								<Box
									py="2"
									px="8"
									gap="4"
									borderRadius="8"
									border="dividerWeak"
									style={{
										display: 'flex',
										color: '#6F6E77',
										fontWeight: '500',
										flexDirection: 'row',
										alignItems: 'center',
										backgroundColor: '#F4F2F4',
										fontSize: '13px',
									}}
								>
									<IconSolidExclamation
										size={14}
										opacity="0.8"
										color="#6F6E77"
									/>
									{error}
								</Box>
							) : null}
							<Button
								type="submit"
								disabled={!email?.length}
								trackingId="demo-email-button"
							>
								View demo
							</Button>
						</Box>
					</Form>
				</Box>
			</Box>
		</>
	) : null
}
