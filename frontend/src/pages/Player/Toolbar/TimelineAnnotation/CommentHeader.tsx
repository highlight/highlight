import { Menu, message } from 'antd';
import React, { useContext } from 'react';
import ReplayerContext, { ParsedSessionComment } from '../../ReplayerContext';
import { onGetLinkWithTimestamp } from '../../ShareButton/utils/utils';
import { PlayerSearchParameters } from '../../PlayerHook/utils';
import { useDeleteSessionCommentMutation } from '../../../../graph/generated/hooks';
import { CommentHeader } from '../../../../components/Comment/Comment';

interface Props {
    comment: ParsedSessionComment;
}

const SessionCommentHeader = ({ comment }: Props) => {
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

    return <CommentHeader comment={comment} menu={menu} />;
};

export default SessionCommentHeader;
