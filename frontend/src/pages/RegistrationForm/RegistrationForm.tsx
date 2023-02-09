import Input from '@components/Input/Input'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useSubmitRegistrationFormMutation } from '@graph/hooks'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { Navigate } from 'react-router-dom'

import commonStyles from '../../Common.module.scss'
import Button from '../../components/Button/Button/Button'
import styles from './RegistrationForm.module.scss'

const HEARD_ABOUT_OPTIONS = [
	'Twitter',
	'Product Hunt',
	'YCombinator',
	'Afore Capital',
	'Abstract Ventures',
	'LJ Ventures',
	'Essence VC',
	'Angel Investor',
]

const RegistrationForm = () => {
	const { workspace_id } = useParams<{ workspace_id: string }>()

	const [teamSize, setTeamSize] = useState<string>('')
	const [role, setRole] = useState<string>('')
	const [useCase, setUseCase] = useState<string>('')
	const [heardAbout, setHeardAbout] = useState<string>('')
	const [pun, setPun] = useState<string>('')

	const { setLoadingState } = useAppLoadingContext()

	const [submitRegistrationForm, { loading, data, error }] =
		useSubmitRegistrationFormMutation()

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	const [redirect, setRedirect] = useState(false)
	const waitingForRedirect = !!data && !error
	useEffect(() => {
		if (waitingForRedirect) {
			message.success(`Form submitted, we'll be in touch within 2 days!`)
			setRedirect(true)
		}
	}, [waitingForRedirect])

	// Redirect to the default page for the workspace
	if (redirect) {
		return <Navigate replace to={`/w/${workspace_id}`} />
	}

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (!workspace_id) {
			return
		}

		submitRegistrationForm({
			variables: {
				workspace_id: workspace_id!,
				team_size: teamSize,
				role: role,
				use_case: useCase,
				heard_about: heardAbout,
				pun: pun,
			},
		}).then(() => {
			analytics.track('RegistrationFormSubmitted')
		})
	}

	const isValid =
		teamSize.length > 0 &&
		role.length > 0 &&
		useCase.length > 0 &&
		heardAbout.length > 0 &&
		!waitingForRedirect // disable button when waiting to redirect

	return (
		<>
			<Helmet>
				<title>Free Highlight!</title>
			</Helmet>
			<div className={styles.box} key={workspace_id}>
				<form onSubmit={onSubmit}>
					<h2 className={styles.title}>
						Sign up for 1 week of Free Highlight!
					</h2>
					<p className={styles.subTitle}>
						Looks like you’ve integrated Highlight; congrats! Fill
						out the form below to get 1 extra week of free{' '}
						Highlight. If you’re eligible, we’ll be in touch{' '}
						<strong>within 2 days with confirmation</strong>!{' '}
					</p>
					{error && (
						<div className={commonStyles.errorMessage}>
							Error submitting form
						</div>
					)}
					<label className={styles.inputLabel}>
						Team Size
						<Input
							className={styles.formInput}
							placeholder="3, 8, 100, etc."
							name="teamSize"
							value={teamSize}
							onChange={(e) => {
								setTeamSize(e.target.value)
							}}
							autoComplete="off"
							autoFocus
							required
							type="number"
							disabled={waitingForRedirect}
						/>
					</label>
					<label className={styles.inputLabel}>
						Your Role
						<Input
							className={styles.formInput}
							placeholder="CTO, Hype-man, Company Clown, etc.."
							name="role"
							value={role}
							onChange={(e) => {
								setRole(e.target.value)
							}}
							autoComplete="off"
							required
							disabled={waitingForRedirect}
						/>
					</label>
					<label className={styles.inputLabel}>
						Your Use Case
						<Input
							className={styles.formInput}
							placeholder="Observing user behavior, debugging sessions, etc."
							name="useCase"
							value={useCase}
							onChange={(e) => {
								setUseCase(e.target.value)
							}}
							autoComplete="off"
							required
							disabled={waitingForRedirect}
						/>
					</label>
					<label className={styles.inputLabel}>
						How did you hear about us?
						<Input
							className={styles.formInput}
							placeholder="Product Hunt, Postcard, Carrier Pigeon, etc."
							name="heardAbout"
							value={heardAbout}
							onChange={(e) => {
								setHeardAbout(e.target.value)
							}}
							autoComplete="off"
							required
							disabled={waitingForRedirect}
							type="text"
							list="heardAboutInputs"
						/>
						<datalist id="heardAboutInputs">
							{HEARD_ABOUT_OPTIONS.map((opt) => (
								<option value={opt} key={opt}></option>
							))}
						</datalist>
					</label>
					<label className={styles.inputLabel}>
						What’s your best Highlight pun?
						<Input
							className={styles.formInput}
							placeholder="Why did the chicken cross the road? To Highlight some grub."
							name="pun"
							value={pun}
							onChange={(e) => {
								setPun(e.target.value)
							}}
							autoComplete="off"
							disabled={waitingForRedirect}
						/>
					</label>
					<Button
						trackingId="SubmitRegistrationForm"
						type="primary"
						className={styles.button}
						block
						htmlType="submit"
						disabled={!isValid}
						loading={loading}
						onClick={() => {
							window.Intercom('update', {
								company: {
									id: workspace_id,
									applied_for_extension: true,
								},
							})
						}}
					>
						Get Free Software! 🍭
					</Button>
				</form>
			</div>
		</>
	)
}

export default RegistrationForm
