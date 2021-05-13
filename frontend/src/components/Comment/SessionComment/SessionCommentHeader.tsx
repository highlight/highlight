import { Menu, message } from 'antd';
import { H } from 'highlight.run';
import React, { PropsWithChildren, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import {
    useDeleteSessionCommentMutation,
    useGetSessionQuery,
} from '../../../graph/generated/hooks';
import { PlayerSearchParameters } from '../../../pages/Player/PlayerHook/utils';
import ReplayerContext, {
    ParsedSessionComment,
} from '../../../pages/Player/ReplayerContext';
import { onGetLinkWithTimestamp } from '../../../pages/Player/ShareButton/utils/utils';
import { CommentHeader } from '../CommentHeader';

interface Props {
    comment: ParsedSessionComment;
    menuItems?: CommentHeaderMenuItem[];
    footer?: React.ReactNode;
}

export interface CommentHeaderMenuItem {
    label: string;
    onClick: () => void;
}

const SessionCommentHeader = ({
    comment,
    children,
    menuItems,
    footer,
}: PropsWithChildren<Props>) => {
    const { session_id } = useParams<{ session_id: string }>();
    const { pause } = useContext(ReplayerContext);
    const [deleteSessionComment] = useDeleteSessionCommentMutation({
        refetchQueries: ['GetSessionComments'],
    });
    const history = useHistory();
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
                    const urlSearchParams = new URLSearchParams();
                    urlSearchParams.append(
                        PlayerSearchParameters.commentId,
                        comment?.id
                    );

                    history.replace(
                        `${
                            history.location.pathname
                        }?${urlSearchParams.toString()}`
                    );
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
            {menuItems?.map((menuItem, index) => (
                <Menu.Item onClick={menuItem.onClick} key={index}>
                    {menuItem.label}
                </Menu.Item>
            ))}
        </Menu>
    );

    return (
        <CommentHeader comment={comment} menu={menu} footer={footer}>
            {children}
        </CommentHeader>
    );
};

export default SessionCommentHeader;
