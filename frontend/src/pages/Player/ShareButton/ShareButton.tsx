import { ButtonProps, message } from 'antd';
import { H } from 'highlight.run';
import React from 'react';
import { useParams } from 'react-router-dom';

import { useAuthContext } from '../../../AuthContext';
import Button from '../../../components/Button/Button/Button';
import CopyText from '../../../components/CopyText/CopyText';
import Popover from '../../../components/Popover/Popover';
import Switch from '../../../components/Switch/Switch';
import { useUpdateSessionIsPublicMutation } from '../../../graph/generated/hooks';
import { useReplayerContext } from '../ReplayerContext';
import styles from './ShareButton.module.scss';
import { onGetLinkWithTimestamp } from './utils/utils';

const ShareButton = (props: ButtonProps) => {
    const { time, session } = useReplayerContext();
    const { isHighlightAdmin, isLoggedIn } = useAuthContext();
    const { session_id } = useParams<{ session_id: string }>();

    const [updateSessionIsPublic] = useUpdateSessionIsPublicMutation({
        update(cache) {
            cache.modify({
                fields: {
                    session(existingSession) {
                        const updatedSession = {
                            ...existingSession,
                            is_public: !existingSession.is_public,
                        };
                        return updatedSession;
                    },
                },
            });
        },
    });

    if (!isHighlightAdmin) {
        return OldShareButton(props, time);
    }

    return (
        <Popover
            hasBorder
            placement="bottomLeft"
            isList
            content={
                <div className={styles.popover}>
                    <div className={styles.popoverContent}>
                        <h3>Share internally</h3>
                        <p>
                            All members of your organization are able to view
                            this session.
                        </p>
                        <CopyText
                            text={onGetLinkWithTimestamp(time).toString()}
                        />
                        {isLoggedIn && (
                            <>
                                <h3>Share externally</h3>
                                {!session ? (
                                    <p>Loading...</p>
                                ) : (
                                    <div>
                                        <Switch
                                            checked={!!session?.is_public}
                                            onChange={(checked: boolean) => {
                                                H.track(
                                                    'Toggled session isPublic',
                                                    {
                                                        is_public: checked,
                                                    }
                                                );
                                                updateSessionIsPublic({
                                                    variables: {
                                                        session_id: session_id,
                                                        is_public: checked,
                                                    },
                                                });
                                            }}
                                            label="Allow anyone with the shareable link to view this session."
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            }
            onVisibleChange={(visible) => {
                if (visible) {
                    H.track('Clicked share popover');
                }
            }}
            trigger="click"
        >
            <Button type="primary" {...props} trackingId="ShareSession">
                Share
            </Button>
        </Popover>
    );
};

const OldShareButton = (props: ButtonProps, time: number) => {
    const onClickHandler = () => {
        const url = onGetLinkWithTimestamp(time);
        message.success('Copied link!');
        navigator.clipboard.writeText(url.href);
    };

    return (
        <Button
            type="primary"
            onClick={onClickHandler}
            {...props}
            trackingId="ShareSession"
        >
            Share
        </Button>
    );
};

export default ShareButton;
