import { ExternalAttachment, IntegrationType, Maybe } from '@graph/schemas'
import {
	IconSolidClickUp,
	IconSolidExternalLink,
	IconSolidGithub,
	IconSolidGitlab,
	IconSolidHeight,
	IconSolidJira,
	IconSolidLinear,
	Tag,
	Text,
} from '@highlight-run/ui/components'
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
		case IntegrationType.Jira:
			return <IconSolidJira />
		case IntegrationType.GitLab:
			return <IconSolidGitlab />
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
			if (a.external_id.startsWith('https:')) {
				return a.external_id
			}
			return `https://height.app/${a.external_id}`
		case IntegrationType.GitHub:
			return a.external_id
		case IntegrationType.Jira:
			return a.external_id
		case IntegrationType.GitLab:
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
					iconLeft={attachment.icon}
					iconRight={<IconSolidExternalLink />}
					onClick={() => window.open(attachment.url, '_blank')}
					style={{ maxWidth: 115, overflow: 'hidden' }}
				>
					<Text lines="1">{attachment.title}</Text>
				</Tag>
			))}
		</>
	)
}

export default AttachmentList
