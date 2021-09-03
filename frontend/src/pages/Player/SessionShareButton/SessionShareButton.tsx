import { useParams } from '@util/react-router/useParams';
import { ButtonProps, message } from 'antd';
import { H } from 'highlight.run';
import React, { useState } from 'react';

import { useAuthContext } from '../../../authentication/AuthContext';
import ShareButton from '../../../components/Button/ShareButton/ShareButton';
import CopyText from '../../../components/CopyText/CopyText';
import Modal from '../../../components/Modal/Modal';
import ModalBody from '../../../components/ModalBody/ModalBody';
import Switch from '../../../components/Switch/Switch';
import { useUpdateSessionIsPublicMutation } from '../../../graph/generated/hooks';
import SvgShareIcon from '../../../static/ShareIcon';
import { useReplayerContext } from '../ReplayerContext';
import styles from './SessionShareButton.module.scss';
import { onGetLink, onGetLinkWithTimestamp } from './utils/utils';

const SessionShareButton = (props: ButtonProps) => {
    const { time } = useReplayerContext();
    const { isHighlightAdmin, isLoggedIn } = useAuthContext();
    const [showModal, setShowModal] = useState(false);
    const [shareTimestamp, setShareTimestamp] = useState(false);

    if (!isHighlightAdmin) {
        return (
            <ShareButton
                {...props}
                trackingId="sessionShareButton"
                onClick={() => {
                    const url = onGetLinkWithTimestamp(time);
                    message.success('Copied link!');
                    navigator.clipboard.writeText(url.href);
                }}
            />
        );
    }

    return (
        <>
            <ShareButton
                {...props}
                trackingId="sessionShareButton"
                onClick={() => {
                    H.track('Clicked share button');
                    setShowModal(true);
                }}
            >
                <SvgShareIcon />
                Share
            </ShareButton>
            <Modal
                visible={showModal}
                onCancel={() => {
                    setShowModal(false);
                }}
                destroyOnClose
                centered
                width={500}
                title="Session Sharing"
            >
                <ModalBody>
                    <CopyText
                        text={
                            shareTimestamp
                                ? onGetLinkWithTimestamp(time).toString()
                                : onGetLink().toString()
                        }
                    />
                    <hr className={styles.divider} />
                    <h3>Sharing Options</h3>
                    {isLoggedIn && <ExternalSharingToggle />}
                    <Switch
                        checked={shareTimestamp}
                        onChange={(checked: boolean) => {
                            setShareTimestamp(checked);
                        }}
                        label="Include current timestamp"
                    />
                </ModalBody>
            </Modal>
        </>
    );
};

const ExternalSharingToggle = () => {
    const { session } = useReplayerContext();
    const { session_id } = useParams<{
        session_id: string;
    }>();
    const [updateSessionIsPublic] = useUpdateSessionIsPublicMutation({
        update(cache, { data }) {
            const is_public = data?.updateSessionIsPublic?.is_public === true;
            cache.modify({
                fields: {
                    session(existingSession) {
                        const updatedSession = {
                            ...existingSession,
                            is_public,
                        };
                        return updatedSession;
                    },
                },
            });
        },
    });
    return (
        <div className={styles.externalSharingToggle}>
            <Switch
                loading={!session}
                checked={!!session?.is_public}
                onChange={(checked: boolean) => {
                    H.track('Toggled session isPublic', {
                        is_public: checked,
                    });
                    updateSessionIsPublic({
                        variables: {
                            session_id: session_id,
                            is_public: checked,
                        },
                    });
                }}
                label="Allow anyone with the link to access this session."
            />
        </div>
    );
};

export default SessionShareButton;
