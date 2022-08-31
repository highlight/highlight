import { useAuthContext } from '@authentication/AuthContext';
import CopyText from '@components/CopyText/CopyText';
import Modal from '@components/Modal/Modal';
import ModalBody from '@components/ModalBody/ModalBody';
import Switch from '@components/Switch/Switch';
import { useUpdateErrorGroupIsPublicMutation } from '@graph/hooks';
import { ErrorGroup } from '@graph/schemas';
import SvgShareIcon from '@icons/ShareIcon';
import { Maybe } from 'graphql/jsutils/Maybe';
import React, { CSSProperties, useState } from 'react';

import ShareButton from '../../../../components/Button/ShareButton/ShareButton';
import styles from './ErrorShareButton.module.scss';

interface Props {
    errorGroup: Maybe<Pick<ErrorGroup, 'secure_id' | 'is_public'>> | undefined;
    style?: CSSProperties;
}

const ErrorShareButton = ({ errorGroup, style }: Props) => {
    const { isLoggedIn } = useAuthContext();
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <ShareButton
                trackingId="errorShareButton"
                onClick={() => {
                    setShowModal(true);
                }}
                style={style}
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
                    <CopyText
                        text={window.location.href}
                        onCopyTooltipText="Copied error link to clipboard!"
                    />
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
    const [updateErrorGroupIsPublic, { loading }] =
        useUpdateErrorGroupIsPublicMutation({
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
                setMarginForAnimation
            />
        </div>
    );
};

export default ErrorShareButton;
