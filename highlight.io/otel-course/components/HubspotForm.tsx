import React, { useEffect } from 'react'
import { OTEL_COURSE_LOCAL_STORAGE_KEY } from '../hooks'

declare global {
	interface Window {
		hbspt?: any
	}
}

interface HubspotFormProps {
	onSuccess?: () => void
}

const HUBSPOT_SCRIPT_ID = 'hubspot-form-script'

export default function HubspotForm({ onSuccess }: HubspotFormProps) {
	useEffect(() => {
		// Check if script already exists
		let script = document.getElementById(
			HUBSPOT_SCRIPT_ID,
		) as HTMLScriptElement

		const createForm = () => {
			if (window.hbspt) {
				window.hbspt.forms.create({
					portalId: '20473940',
					formId: 'deb777ef-173a-4fb4-8491-245491ca13ed',
					target: '#hubspot-form-container',
					inlineMessage:
						"You're signed up! You will be redirected shortly.",
					onFormSubmit: () => {
						if (window.dataLayer) {
							window.dataLayer.push({ event: 'course_submit' })
						}
						localStorage.setItem(
							OTEL_COURSE_LOCAL_STORAGE_KEY,
							'true',
						)
						if (onSuccess) {
							onSuccess()
						}
					},
				})
			}
		}

		if (!script) {
			script = document.createElement('script')
			script.id = HUBSPOT_SCRIPT_ID
			script.src = '//js.hsforms.net/forms/embed/v2.js'
			script.async = true
			script.onload = createForm
			document.body.appendChild(script)
		} else {
			createForm()
		}

		return () => {
			if (script && document.body.contains(script)) {
				document.body.removeChild(script)
			}
		}
	}, [onSuccess])

	return (
		<div
			id="hubspot-form-container"
			className="hubspot-form-container w-full"
			style={{ maxWidth: '100%' }}
		/>
	)
}
