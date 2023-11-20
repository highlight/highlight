import { Column, Img, Link, Section, Text } from '@react-email/components'
import * as React from 'react'

export interface Session {
	activeLength: string
	activityGraphUrl: string
	avatarUrl: string
	country: string
	identifier: string
	insights?: string[]
	screenshotUrl: string
	url: string
}

interface SessionPreviewProps {
	hideViewSessionButton?: boolean
	session: Session
}

export const SessionPreview: React.FC<SessionPreviewProps> = ({
	hideViewSessionButton,
	session,
}) => {
	const {
		activeLength,
		activityGraphUrl,
		avatarUrl,
		country,
		identifier,
		insights = [],
		screenshotUrl,
		url,
	} = session

	return (
		<>
			<Section width={378}>
				<Link href={url}>
					<Img
						src={screenshotUrl}
						style={sessionScreenshot}
						width={378}
						height={206}
					/>
				</Link>
			</Section>
			<Section width={378} style={sessionAttributes}>
				<Column align="left" width={266} style={sessionProperties}>
					<Section align="left" style={leftAlign}>
						<Text style={identifierContainer}>
							{session.avatarUrl && (
								<>
									<Img
										src={avatarUrl}
										width="22"
										height="22"
										style={avatar}
									/>
									&nbsp;
								</>
							)}
							<a style={identifierText}>{identifier}</a>
						</Text>
					</Section>
					<Section align="left" style={leftAlign}>
						<span style={sessionProperty}>{country}</span>
						&nbsp;
						<span style={sessionProperty}>{activeLength}</span>
					</Section>
					{!hideViewSessionButton && (
						<Section
							align="left"
							style={{ ...leftAlign, marginTop: '8px' }}
						>
							<Link style={viewSessionText} href={session.url}>
								View Session →
							</Link>
						</Section>
					)}
				</Column>
				<Column width={132} style={activityGraphColumn}>
					<Img
						style={activityGraph}
						src={activityGraphUrl}
						width="132"
						height="66"
						alt="Session activity graph"
					/>
				</Column>
			</Section>
			{insights.map((i, idx) => (
				<Section width={378} key={idx} style={insight}>
					<Column width={24} style={numberLabel}>
						{idx + 1}
					</Column>
					<Column width={354} style={{ wordBreak: 'break-all' }}>
						<Text style={insightText}>{i}</Text>
					</Column>
				</Section>
			))}
		</>
	)
}

const text = {
	color: '#ffffff',
}

const anchor = {
	color: '#72e4fc',
}

const insight = {
	border: '1px solid #30294e',
	borderRadius: '6px',
	padding: '8px',
	marginTop: '8px',
	fontSize: '14px',
}

const numberLabel = {
	color: '#9d97aa',
	backgroundColor: '#30294e',
	borderRadius: '3px',
}

const sessionScreenshot = {
	backgroundImage:
		'url("https://static.highlight.io/assets/session-insights/session4.png")',
	borderRadius: '6px',
	objectFit: 'cover' as const,
	width: '378px',
	height: '206px',
}

const identifierContainer = {
	color: '#ffffff',
	margin: '8px 0',
	fontSize: '16px',
	height: '24px',
	overflow: 'hidden',
	textAlign: 'left' as const,
}

const identifierText = {
	color: '#ffffff',
	textDecoration: 'none',
}

const sessionAttributes = {
	marginBottom: '16px',
	marginTop: '8px',
}

const viewSessionText = {
	...anchor,
	fontSize: '16px',
}

const leftAlign = {
	textAlign: 'left' as const,
}

const sessionProperties = {
	textAlign: 'left' as const,
	fontSize: '16px',
}

const sessionProperty = {
	color: '#ffffff',
	backgroundColor: 'rgba(255,255,255,0.32)',
	borderRadius: '100px',
	lineHeight: '26px',
	padding: '2px 12px',
	marginRight: '6px',
}

const avatar = {
	display: 'inline',
	borderRadius: '100px',
	verticalAlign: 'middle',
	marginRight: '4px',
}

const insightText = {
	...text,
	paddingLeft: '8px',
	textAlign: 'left' as const,
	wordBreak: 'break-word' as const,
	margin: '8px 0',
}

const activityGraph = {
	width: '132px',
	height: '66px',
}

const activityGraphColumn = {
	paddingTop: '8px',
	verticalAlign: 'middle',
}
