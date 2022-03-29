import Modal from '@components/Modal/Modal';
import { Session } from '@graph/schemas';
import { Coordinates2D } from '@pages/Player/PlayerCommentCanvas/PlayerCommentCanvas';
import { NewCommentForm } from '@pages/Player/Toolbar/NewCommentForm/NewCommentForm';
import { getNewCommentFormCoordinates } from '@pages/Player/utils/utils';
import React from 'react';

import styles from './NewCommentModal.module.scss';

interface Props {
    newCommentModalRef: React.RefObject<HTMLDivElement>;
    commentTime: number;
    onCancel: () => void;
    commentModalPosition?: Coordinates2D;
    commentPosition?: Coordinates2D;
    session?: Session;
    session_secure_id?: string;
    error_secure_id?: string;
    mask?: boolean;
    title?: string;
    errorTitle?: string;
}
export function NewCommentModal({
    newCommentModalRef,
    commentModalPosition,
    commentPosition,
    commentTime,
    session,
    onCancel,
    session_secure_id,
    error_secure_id,
    mask,
    title,
    errorTitle,
}: Props) {
    return (
        <Modal
            mask={!!mask}
            visible={commentModalPosition !== undefined}
            onCancel={onCancel}
            // Sets the Modal's mount node as the player center panel.
            // The default is document.body
            // We override here to be able to show the comments when the player is in fullscreen
            // Without this, the new comment modal would be below the fullscreen view.
            getContainer={() => {
                const playerCenterPanel = document.getElementById(
                    'playerCenterPanel'
                );

                if (playerCenterPanel) {
                    return playerCenterPanel;
                }

                return document.body;
            }}
            destroyOnClose
            minimal
            minimalPaddingSize="var(--size-large)"
            width="500px"
            style={{
                ...getNewCommentFormCoordinates(
                    400,
                    commentModalPosition?.x,
                    commentModalPosition?.y
                ),
                margin: 0,
            }}
            modalRender={(node) => (
                <div className={styles.commentModal}>{node}</div>
            )}
        >
            <div ref={newCommentModalRef}>
                {title ? <h1 className={styles.title}>{title}</h1> : null}
                <NewCommentForm
                    commentTime={Math.floor(commentTime)}
                    onCloseHandler={onCancel}
                    commentPosition={commentPosition}
                    parentRef={newCommentModalRef}
                    session={session}
                    error_secure_id={error_secure_id}
                    session_secure_id={session_secure_id}
                    errorTitle={errorTitle}
                />
            </div>
        </Modal>
    );
}
