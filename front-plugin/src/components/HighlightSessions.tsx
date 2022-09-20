import React, { useEffect, useState } from 'react'
import { useFrontContext } from '../providers/frontContext'
import { Button, Paragraph } from '@frontapp/ui-kit'
import { H } from 'highlight.run'

function getProjectID() {
	const params = new Proxy(new URLSearchParams(window.location.search), {
		get: (searchParams, prop) => searchParams.get(prop.toString()),
	}) as { project?: number }
	return params.project || 1
}

function HighlightSessions() {
	const frontContext = useFrontContext()
	const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({
		start: undefined,
		end: undefined,
	})

	const user = frontContext?.teammate?.name || 'there'
	const email =
		frontContext?.type === 'singleConversation'
			? frontContext?.conversation?.recipient?.handle || ''
			: ''
	const recipient =
		frontContext?.type === 'singleConversation'
			? frontContext?.conversation?.recipient?.name ||
			  email ||
			  'recipient'
			: email || 'recipient'

	useEffect(() => {
		if (frontContext?.type === 'singleConversation') {
			frontContext.listMessages().then((response) => {
				if (response.results.length > 0) {
					const latestMessageIndex = response.results.length - 1
					const start = new Date(response.results[0].date)
					// offset by 7 days
					start.setDate(start.getDate() - 7)
					const end = new Date(
						response.results[latestMessageIndex].date,
					)
					setDateRange({
						start,
						end,
					})
				}
			})
		}
	}, [frontContext])

	const projectId = getProjectID()
	const url = encodeURI(
		`https://app.highlight.run/${projectId}/sessions?query=and` +
			`||user_email,contains,${email}` +
			`||custom_created_at,between_date,${dateRange.start}_${dateRange.end}`,
	)
	return (
		<div className="App">
			<Paragraph>
				<h2>Hello {user}!</h2>
			</Paragraph>
			<Button
				onClick={() => {
					H.track('ClickHighlightSessions', { projectId, email, url })
					window.open(url, '_blank')
				}}
			>
				Sessions for {recipient}
			</Button>
		</div>
	)
}

export default HighlightSessions
