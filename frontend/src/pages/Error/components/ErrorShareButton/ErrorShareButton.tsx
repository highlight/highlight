import { useAuthContext } from '@authentication/AuthContext';
import CopyText from '@components/CopyText/CopyText';
import Modal from '@components/Modal/Modal';
import ModalBody from '@components/ModalBody/ModalBody';
import Switch from '@components/Switch/Switch';
import { useUpdateErrorGroupIsPublicMutation } from '@graph/hooks';
import SvgShareIcon from '@icons/ShareIcon';
import { message } from 'antd';
import { Maybe } from 'graphql/jsutils/Maybe';
import React, { useState } from 'react';

import ShareButton from '../../../../components/Button/ShareButton/ShareButton';
import { ErrorGroup } from '../../../../graph/generated/schemas';
import styles from './ErrorShareButton.module.scss';

interface Props {
    errorGroup: Maybe<Pick<ErrorGroup, 'secure_id' | 'is_public'>> | undefined;
}

const ErrorShareButton = ({ errorGroup }: Props) => {
    const { isHighlightAdmin, isLoggedIn } = useAuthContext();
    const [showModal, setShowModal] = useState(false);

    if (!isHighlightAdmin) {
        return (
            <ShareButton
                trackingId="errorShareButton"
                onClick={() => {
                    message.success('Copied link!');
                    navigator.clipboard.writeText(window.location.href);
                }}
            />
        );
    }

    return (
        <>
            <ShareButton
                trackingId="errorShareButton"
                onClick={() => {
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
                title="Error Sharing"
            >
                <ModalBody>
                    <CopyText text={window.location.href} />
                    <hr className={styles.divider} />
                    <h3>Sharing Options</h3>
                    {isLoggedIn && (
                        <ExternalSharingToggle errorGroup={errorGroup} />
                    )}
                </ModalBody>
            </Modal>
        </>
    );
};

const ExternalSharingToggle = ({ errorGroup }: Props) => {
    const [
        updateErrorGroupIsPublic,
        { loading },
    ] = useUpdateErrorGroupIsPublicMutation({
        update(cache, { data }) {
            const is_public =
                data?.updateErrorGroupIsPublic?.is_public === true;
            cache.modify({
                fields: {
                    errorGroup(existingErrorGroup) {
                        const updatedErrorGroup = {
                            ...existingErrorGroup,
                            is_public,
                        };
                        return updatedErrorGroup;
                    },
                },
            });
        },
    });

    return (
        <div className={styles.externalSharingToggle}>
            <Switch
                loading={loading}
                checked={!!errorGroup?.is_public}
                onChange={(checked: boolean) => {
                    updateErrorGroupIsPublic({
                        variables: {
                            error_group_secure_id: errorGroup?.secure_id || '',
                            is_public: checked,
                        },
                    });
                }}
                label="Allow anyone with the link to view this error."
                trackingId="ErrorSharingExternal"
            />
        </div>
    );
};

export default ErrorShareButton;
