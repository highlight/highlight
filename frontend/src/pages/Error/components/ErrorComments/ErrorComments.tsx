import AttachmentList from '@components/Comment/AttachmentList/AttachmentList';
import MenuItem from '@components/Menu/MenuItem';
import NewIssueModal from '@components/NewIssueModal/NewIssueModal';
import { namedOperations } from '@graph/operations';
import SvgFileText2Icon from '@icons/FileText2Icon';
import SvgTrashIcon from '@icons/TrashIcon';
import { LINEAR_INTEGRATION } from '@pages/IntegrationsPage/Integrations';
import { Coordinates2D } from '@pages/Player/PlayerCommentCanvas/PlayerCommentCanvas';
import { NewCommentModal } from '@pages/Player/Toolbar/NewCommentModal/NewCommentModal';
import { getErrorTitle } from '@util/errors/errorUtils';
import { useParams } from '@util/react-router/useParams';
import { Menu } from 'antd';
import { H } from 'highlight.run';
import React, { useMemo, useState } from 'react';

import Button from '../../../../components/Button/Button/Button';
import { CommentHeader } from '../../../../components/Comment/CommentHeader';
import { useDeleteErrorCommentMutation } from '../../../../graph/generated/hooks';
import CommentTextBody from '../../../Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody';
import styles from '../../ErrorPage.module.scss';

interface Props {
    parentRef?: React.RefObject<HTMLDivElement>;
}
const ErrorComments = ({ parentRef }: Props) => {
    const pRef = React.useRef<HTMLDivElement>(null);
    const { error_secure_id } = useParams<{
        error_secure_id: string;
    }>();
    const [commentModalPosition, setCommentModalPosition] = useState<
        Coordinates2D | undefined
    >(undefined);

    const onOpenErrorComment = () => {
        // offset by half the modal size to make the modal look centered
        setCommentModalPosition({
            x: window.innerWidth / 2 - 200,
            y: window.innerHeight / 2 - 100,
        });
    };
    return (
        <>
            <NewCommentModal
                newCommentModalRef={parentRef ?? pRef}
                commentModalPosition={commentModalPosition}
                onCancel={() => {
                    setCommentModalPosition(undefined);
                }}
                commentTime={0}
                error_secure_id={error_secure_id}
            />
            <div
                className={styles.actionButtonsContainer}
                style={{ margin: 0 }}
            >
                <div className={styles.actionButtons}>
                    <Button
                        trackingId="CreateErrorComment"
                        type="primary"
                        onClick={onOpenErrorComment}
                    >
                        Create a Comment
                    </Button>
                </div>
            </div>
        </>
    );
};

export const ErrorCommentCard = ({ comment, errorGroup }: any) => (
    <div className={styles.commentDiv}>
        <ErrorCommentHeader comment={comment} errorGroup={errorGroup}>
            <CommentTextBody commentText={comment.text} />
        </ErrorCommentHeader>
        {comment.attachments.length > 0 && (
            <AttachmentList attachments={comment.attachments} />
        )}
    </div>
);

const ErrorCommentHeader = ({ comment, children, errorGroup }: any) => {
    const [deleteSessionComment] = useDeleteErrorCommentMutation({
        refetchQueries: [namedOperations.Query.GetErrorComments],
    });

    const [showNewIssueModal, setShowNewIssueModal] = useState(false);

    const defaultIssueTitle = useMemo(() => {
        if (errorGroup?.error_group?.event) {
            return getErrorTitle(errorGroup?.error_group?.event);
        }
        return `Issue from this bug error`;
    }, [errorGroup]);

    const createIssueMenuItem = (
        <MenuItem
            icon={<SvgFileText2Icon />}
            onClick={() => {
                H.track('Create Issue from Comment');
                setShowNewIssueModal(true);
            }}
        >
            Create Issue from Comment
        </MenuItem>
    );

    const moreMenu = (
        <Menu>
            {createIssueMenuItem}
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
        </Menu>
    );

    return (
        <CommentHeader moreMenu={moreMenu} comment={comment}>
            {children}
            <NewIssueModal
                selectedIntegration={LINEAR_INTEGRATION}
                visible={showNewIssueModal}
                changeVisible={setShowNewIssueModal}
                commentId={parseInt(comment.id, 10)}
                commentText={comment.text}
                commentType="ErrorComment"
                defaultIssueTitle={defaultIssueTitle || ''}
            />
        </CommentHeader>
    );
};

export default ErrorComments;
