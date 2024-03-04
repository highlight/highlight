import { Button, Column, Link, Row, Text } from '@react-email/components'
import * as React from 'react'

import {
	AlertContainer,
	Break,
	CtaLink,
	Footer,
	highlightedTextStyle,
	Subtitle,
	textStyle,
	Title,
} from '../components/alerts'
import { EmailHtml, HighlightLogo } from '../components/common'

export interface ErrorAlertEmailProps {
	alertLink?: string
	errorCount?: number
	errorEvent?: string
	errorLink?: string
	firstError?: boolean
	projectName?: string
	serviceName?: string
	sessionExcluded?: boolean
	sessionLink?: string
}

export const ErrorAlertEmail = ({
	alertLink = 'https://localhost:3000/1/alerts/errors/1',
	errorCount = 20,
	errorEvent = 'Uncaught ServerError: Response not successful: Received status code 500',
	errorLink = 'https://localhost:3000/1/errors/rBV1x0XMOx7CMiKmOGBml9S7PEJY',
	firstError = true,
	projectName = 'Highlight Production (app.highlight.io)',
	serviceName = 'private-graph',
	sessionExcluded = false,
	sessionLink = 'https://localhost:3000/1/sessions/6r5FU4u4SYs4AG4kZjnLHyU5K2N7',
}: ErrorAlertEmailProps) => {
	const location = serviceName || projectName
	const errortext = firstError ? 'First error' : 'error'

	return (
		<EmailHtml previewText={`${errortext} in ${location}`}>
			<HighlightLogo />
			<Title>
				<span style={highlightedTextStyle}>{errortext}</span> in{' '}
				<span style={highlightedTextStyle}>{location}</span>
			</Title>
			<Subtitle>{projectName}</Subtitle>

			<AlertContainer>
				<Text style={textStyle}>{errorEvent}</Text>

				<Break />

				<Row style={statContainer}>
					<Column>
						<Text style={leftStat}>
							<span style={statHeader}>Occurences</span>
							{errorCount}
						</Text>
					</Column>
					<Column>
						<Text style={rightStat}>
							<span style={statHeader}>Session</span>
							{sessionExcluded ? (
								'No recorded session'
							) : (
								<Link href={sessionLink}>View session</Link>
							)}
						</Text>
					</Column>
				</Row>
				<CtaLink href={errorLink} label="Open" />
			</AlertContainer>

			<Row style={actionContainer}>
				<Column style={buttonColumn}>
					<Button
						href={`${errorLink}?action=resolved`}
						style={actionButton}
					>
						Resolve
					</Button>
				</Column>
				<Column style={buttonColumn}>
					<Button
						href={`${errorLink}?action=ignored`}
						style={actionButton}
					>
						Ignore
					</Button>
				</Column>
				<Column style={buttonColumn}>
					<Button
						href={`${errorLink}?action=snooze`}
						style={actionButton}
					>
						Snooze
					</Button>
				</Column>
			</Row>

			<Break />

			<Footer alertLink={alertLink} />
		</EmailHtml>
	)
}

const statContainer = {
	marginBottom: '12px',
}

const leftStat = {
	...textStyle,
	textAlign: 'left' as const,
}

const rightStat = {
	...textStyle,
	textAlign: 'right' as const,
}

const statHeader = {
	...textStyle,
	color: '#9d97aa',
	marginRight: '8px',
}

const actionContainer = {
	marginBottom: '36px',
}

const buttonColumn = {
	width: '33%',
}

const actionButton = {
	backgroundColor: '#72E4FC',
	borderRadius: '6px',
	color: '#0D0225',
	paddingTop: '5px',
	paddingBottom: '5px',
	width: '90%',
}

export default ErrorAlertEmail
