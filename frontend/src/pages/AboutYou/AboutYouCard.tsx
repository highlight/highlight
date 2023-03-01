import { useAuthContext } from '@authentication/AuthContext'
import Button from '@components/Button/Button/Button'
import Card, {
	CardForm,
	CardFormActionsContainer,
	CardHeader,
	CardSubHeader,
} from '@components/Card/Card'
import CardSelect from '@components/CardSelect/CardSelect'
import Input from '@components/Input/Input'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import {
	useGetAdminLazyQuery,
	useUpdateAdminAboutYouDetailsMutation,
} from '@graph/hooks'
import { Landing } from '@pages/Landing/Landing'
import analytics from '@util/analytics'
import { getAttributionData } from '@util/attribution'
import { message } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useToggle } from 'react-use'

import styles from './AboutYouCard.module.scss'

interface Props {
	onSubmitHandler: () => void
}

const AboutYouPage = ({ onSubmitHandler }: Props) => {
	const { setLoadingState } = useAppLoadingContext()
	const { admin } = useAuthContext()
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [isEngineeringRole, toggleIsEngineeringRole] = useToggle(false)
	const [isProductRole, toggleIsProductRole] = useToggle(false)
	const [role, setRole] = useState('')
	const [getAdminQuery, { loading: adminDataLoading }] = useGetAdminLazyQuery(
		{
			fetchPolicy: 'network-only',
			onCompleted: useCallback(onSubmitHandler, [onSubmitHandler]),
		},
	)
	const [updateAdminAboutYourDetails, { loading }] =
		useUpdateAdminAboutYouDetailsMutation()

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	useEffect(() => {
		if (admin) {
			const [adminFirstName, adminLastName] = admin.name.split(' ')
			setFirstName(adminFirstName || '')
			setLastName(adminLastName || '')
		}
	}, [admin])

	useEffect(() => analytics.page('/about_you'), [])

	const onFormSubmit = async (e: { preventDefault: () => void }) => {
		analytics.track('About you submitted')
		e.preventDefault()
		const attributionData = getAttributionData()

		try {
			let persona = 'ENGINEERING'

			if (isProductRole && isEngineeringRole) {
				persona = 'PRODUCT_AND_ENGINEERING'
			} else if (isProductRole) {
				persona = 'PRODUCT'
			} else if (isEngineeringRole) {
				persona = 'ENGINEERING'
			}

			await updateAdminAboutYourDetails({
				variables: {
					adminDetails: {
						first_name: firstName,
						last_name: lastName,
						user_defined_role: role,
						user_defined_persona: persona,
						referral: attributionData.referral,
					},
				},
			})

			if (window.Intercom) {
				window.Intercom('update', {
					isProductPersona: isProductRole,
					isEngineeringPersona: isEngineeringRole,
				})
			}
			getAdminQuery()
			message.success(`Nice to meet you ${firstName}, let's get started!`)
		} catch {
			analytics.track('About you submission error')
			message.error('Something went wrong, try again?')
		}
	}

	return (
		<Landing>
			<Helmet>
				<title>About You</title>
			</Helmet>
			<Card className={styles.card}>
				<CardHeader>Tell us about yourself!</CardHeader>
				<CardSubHeader>
					If you don't mind, a few quick questions before we get you
					Highlighting!
				</CardSubHeader>

				<CardForm onSubmit={onFormSubmit}>
					<section className={styles.section}>
						<h3>What's your name?</h3>
						<div className={styles.name}>
							<Input
								placeholder="First Name"
								name="First Name"
								value={firstName}
								onChange={(e) => {
									setFirstName(e.target.value)
								}}
								autoFocus
							/>
							<Input
								placeholder="Last Name"
								name="Last Name"
								value={lastName}
								onChange={(e) => {
									setLastName(e.target.value)
								}}
							/>
						</div>
					</section>

					<section className={styles.section}>
						<h3>What's your role?</h3>
						<Input
							placeholder="Your Role (e.g. CEO, CTO, Engineer, Product Manager)"
							name="Role"
							value={role}
							onChange={(e) => {
								setRole(e.target.value)
							}}
							autoComplete="off"
						/>
					</section>

					<section className={styles.section}>
						<h3>What's your use case for Highlight?</h3>
						<div className={styles.roleContainer}>
							<CardSelect
								title="Product / Support"
								description={`I'll be using Highlight for product and support.`}
								isSelected={isProductRole}
								onClick={toggleIsProductRole}
							/>
							<CardSelect
								title="Engineering"
								description="I’ll be using Highlight for debugging and monitoring."
								isSelected={isEngineeringRole}
								onClick={toggleIsEngineeringRole}
							/>
						</div>
					</section>
					<CardFormActionsContainer>
						<Button
							trackingId="AboutYouPageNext"
							type="primary"
							block
							loading={loading || adminDataLoading}
							htmlType="submit"
							disabled={
								firstName.length === 0 ||
								lastName.length === 0 ||
								role.length === 0 ||
								(!isEngineeringRole && !isProductRole)
							}
						>
							Let's Go!
						</Button>
					</CardFormActionsContainer>
				</CardForm>
			</Card>
		</Landing>
	)
}

export default AboutYouPage
