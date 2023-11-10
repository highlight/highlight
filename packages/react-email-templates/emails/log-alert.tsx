import {
	Body,
	Column,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
	Row,
} from '@react-email/components'
import * as React from 'react'

export interface LogAlertEmailProps {
	projectId?: number
	projectName?: string
	alertName?: string
	alertLink?: string
	query?: string
	belowThreshold?: boolean
	count?: number
	threshold?: number
}

const css = `
    a {
        color: unset;
		text-decoration: none;
    }
`

export const SessionInsightsEmail = ({
	projectId = 1,
	projectName = 'Highlight Production (app.highlight.io)',
	alertName = 'Log Alert',
	alertLink = 'https://localhost:3000/1/alerts/logs/1',
	query = 'level:info',
	belowThreshold = false,
	count = 24,
	threshold = 20,
}: LogAlertEmailProps) => (
	<Html>
		<Head>
			<style>{css}</style>
		</Head>
		<Preview>{alertName} alert fired</Preview>
		<Body style={main}>
			<Container width={400} style={container}>
				<Img
					src="https://static.highlight.io/assets/digest/logo-on-dark.png"
					width="32"
					height="32"
					alt="Highlight logo"
					style={logo}
				/>
				<Heading style={headingText}>
					<span style={highlightedText}>{alertName}</span> alert fired
				</Heading>
				<Text style={subtitleText}>{projectName}</Text>
				<Section align="center" style={alertContainer}>
					<Text style={text}>
						Log count for query{' '}
						<span style={highlightedText}>{query}</span> is
						currently {belowThreshold ? 'below' : 'above'} the
						threshold.
					</Text>
					<Hr style={hr} />
					<Row style={statContainer}>
						<Column>
							<Text style={leftStat}>
								<span style={statHeader}>Count</span>
								{count}
							</Text>
						</Column>
						<Column>
							<Text style={rightStat}>
								<span style={statHeader}>Threshold</span>
								{threshold}
							</Text>
						</Column>
					</Row>
					<Link href={'https://localhost:3000/1/logs'} style={cta}>
						View logs
						<ExternalLinkIcon />
					</Link>
				</Section>
				<Hr style={hr} />
				<Text style={unsubscribeText}>
					If you don't want to receive emails for these alerts in the
					future, you can edit your alert settings{' '}
					<Link href={alertLink}>here</Link>.
				</Text>
				<Img
					style={logoFull}
					src="https://static.highlight.io/assets/digest/highlight-logo.png"
					width="70"
					height="16"
					alt="Highlight logo"
				/>
				<Text style={footer}>Seattle, WA 98122</Text>
			</Container>
		</Body>
	</Html>
)

export default SessionInsightsEmail

const ExternalLinkIcon = () => {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			style={ctaIcon}
		>
			<path
				d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z"
				fill="#6F6E77"
			/>
			<path
				d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7L8 7C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z"
				fill="#6F6E77"
			/>
		</svg>
	)
}

const main = {
	backgroundColor: '#0d0225',
	fontFamily: 'Helvetica, sans-serif',
}

const container = {
	width: '400px',
	padding: '0 16px',
	textAlign: 'center' as const,
	margin: '0 auto',
}

const hr = {
	color: '#30294e',
	borderTop: '1px solid #30294e',
	margin: '12px 0',
}

const text = {
	color: '#ffffff',
	fontSize: '14px',
	lineHeight: '22px',
	margin: 0,
}

const highlightedText = {
	color: '#ebff5e',
}

const footer = {
	color: '#9d97aa',
	fontSize: '10px',
	lineHeight: '16px',
}

const unsubscribeText = {
	color: '#9d97aa',
	fontSize: '12px',
	lineHeight: '20px',
	margin: '36px 0',
}

const logo = {
	paddingTop: '32px',
	margin: '0 auto',
}

const logoFull = {
	margin: '24px auto 0',
}

const alertContainer = {
	border: '1px solid #30294e',
	borderRadius: '6px',
	padding: '12px',
	margin: '36px 0',
	fontSize: '14px',
}

const subtitleText = {
	...text,
	color: '#9d97aa',
}

const headingText = {
	...text,
	fontSize: '26px',
	lineHeight: '36px',
	paddingTop: '16px',
	paddingBottom: '8px',
}

const statContainer = {
	marginBottom: '12px',
}

const leftStat = {
	...text,
	textAlign: 'left' as const,
}

const rightStat = {
	...text,
	textAlign: 'right' as const,
}

const statHeader = {
	...text,
	color: '#9d97aa',
	marginRight: '8px',
}

const cta = {
	padding: '4px 0',
	color: '#ffffff',
	outline: '1px solid #ffffff',
	borderRadius: '6px',
	fontSize: '16px',
	lineHeight: '26px',
	display: 'table',
	width: '100%',
}

const ctaIcon = {
	verticalAlign: 'bottom',
	padding: '4px 8px',
}
