import Card from '@components/Card/Card'
import Table from '@components/Table/Table'
import { ExternalAttachment, IntegrationType, Maybe } from '@graph/schemas'
import ShareIcon from '@icons/ShareIcon'
import {
	CLICKUP_INTEGRATION,
	HEIGHT_INTEGRATION,
	LINEAR_INTEGRATION,
} from '@pages/IntegrationsPage/Integrations'
import React from 'react'

import styles from './AttachmentList.module.scss'

type ParsedAttachment = ExternalAttachment & { logoUrl: string; url: string }

const TABLE_COLUMNS = [
	{
		title: 'Name',
		dataIndex: 'Name',
		key: 'Name',
		render: (_: string, record: ParsedAttachment) => {
			return (
				<span className={styles.issueTitle}>
					<img src={record.logoUrl} />
					{record.title}
				</span>
			)
		},
	},
	{
		title: 'Open',
		dataIndex: 'Name',
		key: 'Name',
		render: () => {
			return (
				<span className={styles.issueOpenIcon}>
					<ShareIcon />
				</span>
			)
		},
	},
]
interface AttachmentListProps {
	attachments: Maybe<ExternalAttachment>[]
}

const getLogoUrl = (a: Maybe<ExternalAttachment>) => {
	switch (a?.integration_type) {
		case IntegrationType.Linear:
			return LINEAR_INTEGRATION.icon
		case IntegrationType.ClickUp:
			return CLICKUP_INTEGRATION.icon
		case IntegrationType.Height:
			return HEIGHT_INTEGRATION.icon
	}
	return ''
}

const getAttachmentUrl = (a: Maybe<ExternalAttachment>) => {
	switch (a?.integration_type) {
		case IntegrationType.Linear:
			return `https://linear.app/issue/${a.title}`
		case IntegrationType.ClickUp:
			return `https://app.clickup.com/t/${a.external_id}`
	}
	return ''
}

const AttachmentList: React.FC<
	React.PropsWithChildren<AttachmentListProps>
> = ({ attachments }) => {
	const attachmentParsed = React.useMemo(
		() =>
			attachments.map(
				(item) =>
					({
						...item,
						logoUrl: getLogoUrl(item),
						url: getAttachmentUrl(item),
					} as ParsedAttachment),
			),
		[attachments],
	)

	return (
		<Card noPadding className={styles.attachmentList}>
			<Table
				dataSource={attachmentParsed}
				columns={TABLE_COLUMNS}
				pagination={false}
				showHeader={false}
				rowHasPadding
				smallPadding
				onRow={(record: ParsedAttachment) => ({
					onClick: () => {
						window.open(record.url, '_blank')
					},
				})}
			></Table>
		</Card>
	)
}

export default AttachmentList
