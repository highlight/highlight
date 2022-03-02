import { ExternalAttachment, IntegrationType, Maybe } from '@graph/schemas';
import ShareIcon from '@icons/ShareIcon';
import { List } from 'antd';
import React from 'react';

import styles from './AttachmentList.module.scss';
interface AttachmentListProps {
    attachments: Maybe<ExternalAttachment>[];
}
const AttachmentList: React.FC<AttachmentListProps> = ({ attachments }) => {
    const attachmentParsed = React.useMemo(
        () =>
            attachments.map((item) => ({
                ...item,
                logoUrl:
                    item?.integration_type === IntegrationType.Linear
                        ? '/images/integrations/linear.png'
                        : '',
                url:
                    item?.integration_type === IntegrationType.Linear
                        ? `https://linear.app/issue/${item.title}`
                        : '',
            })),
        [attachments]
    );

    return (
        <List bordered size="small" className={styles.attachmentList}>
            {attachmentParsed.map((attachment) => (
                <List.Item key={attachment?.id}>
                    <a
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.attachmentLink}
                    >
                        <span>
                            <img src={attachment.logoUrl} />
                            {attachment.title}
                        </span>
                        <ShareIcon />
                    </a>
                </List.Item>
            ))}
        </List>
    );
};

export default AttachmentList;
