import { Dropdown, Menu, message } from 'antd';
import classNames from 'classnames';
import moment from 'moment';
import React, { useContext } from 'react';
import ReplayerContext, { ParsedSessionComment } from '../../ReplayerContext';
import toolbarStyles from '../Toolbar.module.scss';
import styles from './CommentHeader.module.scss';
import { HiDotsHorizontal } from 'react-icons/hi';
import { onGetLinkWithTimestamp } from '../../ShareButton/utils/utils';
import { PlayerSearchParameters } from '../../PlayerHook/utils';
import { useDeleteSessionCommentMutation } from '../../../../graph/generated/hooks';

interface Props {
    comment: ParsedSessionComment;
}

const CommentHeader = ({ comment }: Props) => {
    const { pause } = useContext(ReplayerContext);
    const [deleteSessionComment] = useDeleteSessionCommentMutation({
        refetchQueries: ['GetSessionComments'],
    });

    const menu = (
        <Menu>
            <Menu.Item
                onClick={() => {
                    const url = onGetLinkWithTimestamp(comment.timestamp);
                    url.searchParams.set(
                        PlayerSearchParameters.commentId,
                        comment.id
                    );

                    message.success('Copied link!');
                    navigator.clipboard.writeText(url.href);
                }}
            >
                Copy link
            </Menu.Item>
            <Menu.Item
                onClick={() => {
                    pause(comment.timestamp);
                }}
            >
                Goto
            </Menu.Item>
            <Menu.Item
                onClick={() => {
                    deleteSessionComment({
                        variables: {
                            id: comment.id,
                        },
                    });
                }}
            >
                Delete comment
            </Menu.Item>
        </Menu>
    );

    return (
        <div className={classNames(toolbarStyles.commentHeader)}>
            <span className={toolbarStyles.commentAuthor}>
                {comment.author.name || comment.author.email.split('@')[0]}
            </span>
            <span className={toolbarStyles.commentUpdatedTime}>
                {moment(comment.updated_at).fromNow()}
            </span>
            <span className={styles.endActions}>
                <Dropdown
                    overlay={menu}
                    placement="bottomLeft"
                    trigger={['click']}
                >
                    <button className={styles.ellipsisButton}>
                        <HiDotsHorizontal />
                    </button>
                </Dropdown>
            </span>
        </div>
    );
};

export default CommentHeader;
