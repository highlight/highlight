import { namedOperations } from '@graph/operations';
import { SessionCommentType } from '@graph/schemas';
import { getDisplayName } from '@pages/Sessions/SessionsFeedV2/components/MinimalSessionCard/utils/utils';
import { getFeedbackCommentSessionTimestamp } from '@util/comment/util';
import { Menu, message } from 'antd';
import { H } from 'highlight.run';
import React, { PropsWithChildren } from 'react';
import { useHistory } from 'react-router-dom';

import { useDeleteSessionCommentMutation } from '../../../graph/generated/hooks';
import { PlayerSearchParameters } from '../../../pages/Player/PlayerHook/utils';
import {
    ParsedSessionComment,
    useReplayerContext,
} from '../../../pages/Player/ReplayerContext';
import { onGetLinkWithTimestamp } from '../../../pages/Player/SessionShareButton/utils/utils';
import { MillisToMinutesAndSeconds } from '../../../util/time';
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
    const { pause, session, replayer } = useReplayerContext();
    const [deleteSessionComment] = useDeleteSessionCommentMutation({
        refetchQueries: [namedOperations.Query.GetSessionComments],
    });
    const history = useHistory();

    const getCommentLink = () => {
        const url = onGetLinkWithTimestamp(comment.timestamp || 0);
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
            {comment.type === SessionCommentType.Feedback &&
                comment?.metadata?.email && (
                    <Menu.Item
                        onClick={() => {
                            message.success(
                                "Copied the feedback provider's email!"
                            );
                            navigator.clipboard.writeText(
                                comment.metadata?.email as string
                            );
                        }}
                    >
                        Copy feedback email
                    </Menu.Item>
                )}
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

                    let commentTimestamp = comment.timestamp || 0;

                    if (comment.type === SessionCommentType.Feedback) {
                        const sessionStartTime = replayer?.getMetaData()
                            .startTime;

                        if (sessionStartTime) {
                            commentTimestamp = getFeedbackCommentSessionTimestamp(
                                comment,
                                sessionStartTime
                            );
                        }
                    }
                    pause(commentTimestamp);
                    message.success(
                        `Changed player time to where comment was created at ${MillisToMinutesAndSeconds(
                            commentTimestamp
                        )}.`
                    );
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
            {session && (
                <Menu.Item
                    onClick={() => {
                        H.track('Create Linear issue');
                        const url = getCommentLink();
                        window.open(
                            `http://linear.app/new?title=Highlight session comment for ${getDisplayName(
                                session
                            )}&description=${comment.text.replaceAll(
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
