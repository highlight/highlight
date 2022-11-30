import { useAuthContext } from '@authentication/AuthContext'
import Button from '@components/Button/Button/Button'
import Card, {
	CardForm,
	CardFormActionsContainer,
	CardHeader,
	CardSubHeader,
} from '@components/Card/Card'
import CardSelect from '@components/CardSelect/CardSelect'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import {
	useGetAdminLazyQuery,
	useUpdateAdminAboutYouDetailsMutation,
} from '@graph/hooks'
import {
	Button as HighlightButton,
	Form as HighlightForm,
} from '@highlight-run/ui'
import { Landing } from '@pages/Landing/Landing'
import OnboardingCard from '@pages/Login/components/OnboardingCard/OnboardingCard'
import useLocalStorage from '@rehooks/local-storage'
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
	const [phone, setPhone] = useState('')
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
	const [signUpReferral, setSignUpReferral] = useLocalStorage(
		'HighlightSignUpReferral',
		'',
	)

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	useEffect(() => {
		if (admin) {
			const [adminFirstName, adminLastName] = admin.name.split(' ')
			setFirstName(adminFirstName || '')
			setLastName(adminLastName || '')
			setPhone(admin.phone || '')
		}
	}, [admin])

	const onFormSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault()

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
						phone: phone,
						user_defined_role: role,
						referral: signUpReferral,
						user_defined_persona: persona,
					},
				},
			})

			setSignUpReferral('')
			if (window.Intercom) {
				window.Intercom('update', {
					isProductPersona: isProductRole,
					isEngineeringPersona: isEngineeringRole,
				})
			}
			getAdminQuery()
			message.success(`Nice to meet you ${firstName}, let's get started!`)
		} catch {
			message.error('Something went wrong, try again?')
		}
	}

	return (
		<Landing>
			<OnboardingCard>
				<OnboardingCard.Header title="Tell us a bit more" />
				<OnboardingCard.Body>
					<CardForm onSubmit={onFormSubmit}>
						<HighlightForm.Input
							label="First Name"
							name="First Name"
							value={firstName}
							onChange={(e) => {
								setFirstName(e.target.value)
							}}
							autoFocus
						/>
						<HighlightForm.Input
							label="Last Name"
							name="Last Name"
							value={lastName}
							onChange={(e) => {
								setLastName(e.target.value)
							}}
						/>
						<HighlightForm.Input
							label="Organization / Team"
							name="Organization / Team"
							value={lastName}
							onChange={(e) => {
								setLastName(e.target.value)
							}}
						/>
						<HighlightForm.Input
							label="Phone #"
							name="Phone #"
							type={'tel'}
							value={phone}
							onChange={(e) => {
								setPhone(e.target.value)
							}}
							autoFocus
						/>

						<HighlightForm.Input
							name="Role"
							label="Role"
							value={role}
							onChange={(e) => {
								setRole(e.target.value)
							}}
							autoComplete="off"
						/>

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
									description={`I’ll be using Highlight for debugging and monitoring.`}
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
									(phone.length > 0 && phone.length < 10) ||
									(!isEngineeringRole && !isProductRole)
								}
							>
								Let's Go!
							</Button>
						</CardFormActionsContainer>
					</CardForm>
					hello
				</OnboardingCard.Body>
				<OnboardingCard.Footer>
					<HighlightButton
						loading={loading || adminDataLoading}
						disabled={
							firstName.length === 0 ||
							lastName.length === 0 ||
							role.length === 0 ||
							(phone.length > 0 && phone.length < 10) ||
							(!isEngineeringRole && !isProductRole)
						}
					>
						Let's Go!
					</HighlightButton>
				</OnboardingCard.Footer>
			</OnboardingCard>
			<Helmet>
				<title>About You</title>
			</Helmet>
			<Card className={styles.card}>
				<CardHeader>Tell us about yourself!</CardHeader>
				<CardSubHeader>
					If you don't mind, a few quick questions before we get you
					Highlighting!
				</CardSubHeader>
			</Card>
		</Landing>
	)
}

export default AboutYouPage
