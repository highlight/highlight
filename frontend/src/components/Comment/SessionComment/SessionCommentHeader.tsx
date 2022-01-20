import MenuItem from '@components/Menu/MenuItem';
import { namedOperations } from '@graph/operations';
import { SessionCommentType } from '@graph/schemas';
import SvgBallotBoxIcon from '@icons/BallotBoxIcon';
import SvgClipboardIcon from '@icons/ClipboardIcon';
import SvgCopyIcon from '@icons/CopyIcon';
import SvgFileText2Icon from '@icons/FileText2Icon';
import SvgReferrer from '@icons/Referrer';
import SvgTrashIcon from '@icons/TrashIcon';
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

    const moreMenu = (
        <Menu>
            <MenuItem
                icon={<SvgCopyIcon />}
                onClick={() => {
                    const url = getCommentLink();
                    message.success('Copied link!');
                    navigator.clipboard.writeText(url.href);
                }}
            >
                Copy link
            </MenuItem>
            {comment.type === SessionCommentType.Feedback &&
                comment?.metadata?.email && (
                    <MenuItem
                        icon={<SvgClipboardIcon />}
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
                    </MenuItem>
                )}
            <MenuItem
                icon={<SvgReferrer />}
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
            </MenuItem>
            <MenuItem
                icon={<SvgTrashIcon />}
                onClick={() => {
                    deleteSessionComment({
                        variables: {
                            id: comment.id,
                        },
                    });
                }}
            >
                Delete comment
            </MenuItem>
            {session && (
                <MenuItem
                    icon={<SvgFileText2Icon />}
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
                </MenuItem>
            )}
            {menuItems?.map((menuItem, index) => (
                <MenuItem onClick={menuItem.onClick} key={index} icon={<></>}>
                    {menuItem.label}
                </MenuItem>
            ))}
        </Menu>
    );

    const shareMenu = (
        <Menu>
            {session && (
                <MenuItem
                    icon={<SvgFileText2Icon />}
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
                </MenuItem>
            )}
            <MenuItem
                icon={<SvgBallotBoxIcon />}
                onClick={() => {
                    window.open(
                        'https://highlight.canny.io/feature-requests/p/jira-integration',
                        '_blank'
                    );
                }}
            >
                Vote on Jira Integration
            </MenuItem>
            <MenuItem
                icon={<SvgBallotBoxIcon />}
                onClick={() => {
                    window.open(
                        'https://highlight.canny.io/feature-requests/p/clickup-integration',
                        '_blank'
                    );
                }}
            >
                Vote on ClickUp Integration
            </MenuItem>
            <MenuItem
                icon={<SvgBallotBoxIcon />}
                onClick={() => {
                    window.open(
                        'https://highlight.canny.io/feature-requests/p/mondaycom-integration',
                        '_blank'
                    );
                }}
            >
                Vote on Monday Integration
            </MenuItem>
            <MenuItem
                icon={<SvgBallotBoxIcon />}
                onClick={() => {
                    window.open(
                        'https://highlight.canny.io/feature-requests/p/asana-integration',
                        '_blank'
                    );
                }}
            >
                Vote on Asana Integration
            </MenuItem>
            <MenuItem
                icon={<SvgBallotBoxIcon />}
                onClick={() => {
                    window.open(
                        'https://highlight.canny.io/feature-requests?',
                        '_blank'
                    );
                }}
            >
                Suggest an Integration
            </MenuItem>
        </Menu>
    );

    return (
        <CommentHeader
            comment={comment}
            moreMenu={moreMenu}
            footer={footer}
            shareMenu={shareMenu}
        >
            {children}
        </CommentHeader>
    );
};

export default SessionCommentHeader;
