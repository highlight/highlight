import { useAuthContext } from '@authentication/AuthContext'
import { Button } from '@components/Button'
import { Box, Form, Text, useFormStore } from '@highlight-run/ui'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import { Divider } from 'antd'
import React from 'react'
import { Helmet } from 'react-helmet'

export const DemoModal = () => {
	const { isAuthLoading, isLoggedIn } = useAuthContext()
	const [visible, setVisible] = useLocalStorage<boolean>(
		'highlight-demo-email-modal-visible',
		true,
	)
	const formStore = useFormStore({
		defaultValues: {
			email: '',
		},
	})
	const email = formStore.useValue('email')
	const onSubmit = async () => {
		if (!(await formStore.validate())) {
			return
		}
		if (email.indexOf('@gmail.') !== -1) {
			return
		}
		analytics.identify(email, { demo: true })
		analytics.track('demo-email-submit', { email })
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
