import { Link, Text } from '@react-email/components'
import * as React from 'react'

import { Break, Footer, textStyle, Title } from '../components/alerts'
import { EmailHtml, HighlightLogo } from '../components/common'

export interface AlertUpsertEmailProps {
	adminName?: string
	alertAction?: string
	alertLink?: string
	alertName?: string
}

export const AlertUpsertEmail = ({
	adminName = 'Spencer',
	alertAction = 'created',
	alertLink = 'https://localhost:3000/1/alerts/1',
	alertName = 'Log Alert',
}: AlertUpsertEmailProps) => (
	<EmailHtml previewText={`${alertName} alert ${alertAction}`}>
		<HighlightLogo />
		<Title>Alert {alertAction}</Title>

		<Text style={textStyle}>
			{adminName} has {alertAction} the alert "
			<Link href={alertLink}>{alertName}</Link>"
		</Text>

		<Break />

		<Footer alertLink={alertLink} />
	</EmailHtml>
)

export default AlertUpsertEmail
