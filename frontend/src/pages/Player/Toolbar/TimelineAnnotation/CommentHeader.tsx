import { Menu, message } from 'antd';
import React, { useContext } from 'react';
import ReplayerContext, { ParsedSessionComment } from '../../ReplayerContext';
import { onGetLinkWithTimestamp } from '../../ShareButton/utils/utils';
import { PlayerSearchParameters } from '../../PlayerHook/utils';
import { CommentHeader } from '../../../../components/Comment/Comment';
import {
    useDeleteSessionCommentMutation,
    useGetSessionQuery,
} from '../../../../graph/generated/hooks';
import { useParams } from 'react-router-dom';
import { H } from 'highlight.run';

interface Props {
    comment: ParsedSessionComment;
}

const SessionCommentHeader = ({ comment }: Props) => {
    const { session_id } = useParams<{ session_id: string }>();
    const { pause } = useContext(ReplayerContext);
    const [deleteSessionComment] = useDeleteSessionCommentMutation({
        refetchQueries: ['GetSessionComments'],
    });
    const { data } = useGetSessionQuery({
        variables: {
            id: session_id,
        },
        context: { headers: { 'Highlight-Demo': false } },
    });

    const getCommentLink = () => {
        const url = onGetLinkWithTimestamp(comment.timestamp);
        url.searchParams.set(PlayerSearchParameters.commentId, comment.id);
        return url;
    };

    const menu = (
        <Menu>
            <Menu.Item
                onClick={() => {
                    const url = getCommentLink();
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
            {data && (
                <Menu.Item
                    onClick={() => {
                        H.track('Create Linear issue', {});
                        const url = getCommentLink();
                        window.open(
                            `http://linear.app/new?title=Highlight session comment for ${
                                data.session?.identifier
                            }&description=${comment.text.replaceAll(
                                '@',
                                ''
                            )}%0A%0ASession: ${url.href
                                .replaceAll('=', '%3D')
                                .replaceAll('&', '%26')}`,
                            '_blank'
                        );
                    }}
                >
                    Create Linear issue
                </Menu.Item>
            )}
        </Menu>
    );

    return <CommentHeader comment={comment} menu={menu} />;
};

export default SessionCommentHeader;
