'use client'
import { Button, Form } from '@highlight-run/ui/components'
import React from 'react'

import { Metadata } from '@highlight-run/client'
import { H } from 'highlight.run'

export const EventForm = () => {
	const [error, setError] = React.useState<string>()
	const formStore = Form.useStore({
		defaultValues: {
			email: '',
			company: '',
			firstName: '',
			lastName: '',
			companySize: '',
			title: '',
		},
	})
	const firstName = formStore.useValue('firstName')
	const lastName = formStore.useValue('lastName')
	const email = formStore.useValue('email')
	const company = formStore.useValue('company')
	const title = formStore.useValue('title')
	const companySize = formStore.useValue('size')

	const track = (event: string, metadata?: Object) => {
		;(window._hsq = window._hsq || []).push([
			'trackCustomBehavioralEvent',
			{
				name: event,
				properties: metadata,
			},
		])

		H.track(event, metadata as Metadata)
	}

	const identify = (email: string, traits?: Object) => {
		const hsq = (window._hsq = window._hsq || [])
		hsq.push([
			'identify',
			{
				email,
				...traits,
			},
		])
		hsq.push(['trackPageView'])

		H.identify(email, traits as Metadata)
	}

	const analytics = {
		track,
		identify,
	}

	const onSubmit = async () => {
		console.log(email)
		console.log(company)
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

		analytics.identify(email, {
			// hubspot attribute to trigger sequence for this contact
			event_sign_up: true,
			referral_url: window.location.href.split('?')[0],
			event: 'event-email-submit',
			company_name: company,
			job_title: title,
			company_size: companySize,
			first_name: firstName,
			last_name: lastName,
		})
		analytics.track('event-email-submit', {
			email,
			company,
			title,
			companySize,
			firstName,
			lastName,
		})
	}

	return (
		<div className="w-full p-10 rounded-md border border-divider-on-dark">
			<Form store={formStore} onSubmit={onSubmit}>
				<div className="flex items-center flex-grow gap-1 px-2 mb-4 transition-colors border rounded-lg text-copy-on-dark border-divider-on-dark focus-within:border-copy-on-light h-11">
					<Form.Input
						type="text"
						name={formStore.names.firstName}
						placeholder="First Name"
						className={
							'h-full flex-1 leading-none bg-transparent outline-none text-copy-on-dark text-[17px] w-0'
						}
					/>
				</div>
				<div className="flex items-center flex-grow gap-1 px-2 mb-4 transition-colors border rounded-lg text-copy-on-dark border-divider-on-dark focus-within:border-copy-on-light h-11">
					<Form.Input
						type="text"
						name={formStore.names.lastName}
						placeholder="Last Name"
						className={
							'h-full flex-1 leading-none bg-transparent outline-none text-copy-on-dark text-[17px] w-0'
						}
					/>
				</div>
				<div className="flex items-center flex-grow gap-1 px-2 mb-4 transition-colors border rounded-lg text-copy-on-dark border-divider-on-dark focus-within:border-copy-on-light h-11">
					<Form.Input
						type="text"
						name={formStore.names.title}
						placeholder="Job Title"
						className={
							'h-full flex-1 leading-none bg-transparent outline-none text-copy-on-dark text-[17px] w-0'
						}
					/>
				</div>
				<div className="flex items-center flex-grow gap-1 px-2 mb-4 transition-colors border rounded-lg text-copy-on-dark border-divider-on-dark focus-within:border-copy-on-light h-11">
					<Form.Input
						type="email"
						name={formStore.names.email}
						placeholder="Work Email"
						className={
							'h-full flex-1 leading-none bg-transparent outline-none text-copy-on-dark text-[17px] w-0'
						}
					/>
				</div>
				<div className="flex items-center flex-grow gap-1 px-2 mb-4 transition-colors border rounded-lg text-copy-on-dark border-divider-on-dark focus-within:border-copy-on-light h-11">
					<Form.Input
						type="text"
						name={formStore.names.company}
						placeholder="Company"
						className={
							'h-full flex-1 leading-none bg-transparent outline-none text-copy-on-dark text-[17px] w-0'
						}
					/>
				</div>
				<div className="flex items-center flex-grow gap-1 px-2 mb-4 transition-colors border rounded-lg text-copy-on-dark border-divider-on-dark focus-within:border-copy-on-light h-11">
					<Form.Input
						type="number"
						name={formStore.names.companySize}
						placeholder="Company Size"
						className={
							'h-full flex-1 leading-none bg-transparent outline-none text-copy-on-dark text-[17px] w-0'
						}
					/>
				</div>
				<Button
					type="submit"
					disabled={!email?.length}
					className="w-1/2 text-center"
				>
					View Event
				</Button>
			</Form>
		</div>
	)
}
