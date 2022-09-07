import Card from '@components/Card/Card'
import Table from '@components/Table/Table'
import { ExternalAttachment, IntegrationType, Maybe } from '@graph/schemas'
import ShareIcon from '@icons/ShareIcon'
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

const AttachmentList: React.FC<
	React.PropsWithChildren<AttachmentListProps>
> = ({ attachments }) => {
	const attachmentParsed = React.useMemo(
		() =>
			attachments.map(
				(item) =>
					({
						...item,
						logoUrl:
							item?.integration_type === IntegrationType.Linear
								? '/images/integrations/linear.png'
								: '',
						url:
							item?.integration_type === IntegrationType.Linear
								? `https://linear.app/issue/${item.title}`
								: '',
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
