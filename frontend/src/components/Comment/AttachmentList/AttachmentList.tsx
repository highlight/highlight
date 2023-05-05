import { ExternalAttachment, IntegrationType, Maybe } from '@graph/schemas'
import {
	IconSolidClickUp,
	IconSolidGithub,
	IconSolidHeight,
	IconSolidLinear,
	Tag,
} from '@highlight-run/ui'
import React from 'react'

interface AttachmentListProps {
	attachments: Maybe<ExternalAttachment>[]
}

const getIcon = (a: Maybe<ExternalAttachment>) => {
	switch (a?.integration_type) {
		case IntegrationType.Linear:
			return <IconSolidLinear />
		case IntegrationType.ClickUp:
			return <IconSolidClickUp />
		case IntegrationType.Height:
			return <IconSolidHeight />
		case IntegrationType.GitHub:
			return <IconSolidGithub />
	}
	return <></>
}

export const getAttachmentUrl = (a: Maybe<ExternalAttachment>) => {
	switch (a?.integration_type) {
		case IntegrationType.Linear:
			return `https://linear.app/issue/${a.title}`
		case IntegrationType.ClickUp:
			return `https://app.clickup.com/t/${a.external_id}`
		case IntegrationType.Height:
			return `https://height.app/${a.external_id}`
		case IntegrationType.GitHub:
			return a.external_id
	}
	return ''
}

const AttachmentList: React.FC<
	React.PropsWithChildren<AttachmentListProps>
> = ({ attachments }) => {
	const attachmentParsed = React.useMemo(
		() =>
			attachments.map((item) => ({
				...item,
				icon: getIcon(item),
				url: getAttachmentUrl(item),
			})),
		[attachments],
	)

	return (
		<>
			{attachmentParsed.map((attachment) => (
				<Tag
					key={attachment.id}
					shape="basic"
					size="small"
					kind="secondary"
					emphasis="low"
					icon={attachment.icon}
					onClick={() => window.open(attachment.url, '_blank')}
				>
					{attachment.title}
				</Tag>
			))}
		</>
	)
}

export default AttachmentList
