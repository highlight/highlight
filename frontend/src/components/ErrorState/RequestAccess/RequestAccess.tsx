import Button from '@components/Button/Button/Button';
import { useRequestAccessMutation } from '@graph/hooks';
import { useParams } from '@util/react-router/useParams';
import { message } from 'antd';
import { H } from 'highlight.run';
import React, { useState } from 'react';

import styles from './RequestAccess.module.scss';

const RequestAccess = () => {
    const { project_id } = useParams<{
        project_id: string;
    }>();
    const [requestAccess] = useRequestAccessMutation();
    const [sentAccessRequest, setSentAccessRequest] = useState(false);
    return sentAccessRequest ? (
        <p>
            Request sent You'll get an email letting you know if the file is
            shared with you
        </p>
    ) : (
        <Button
            type="primary"
            className={styles.accessButton}
            trackingId={'ErrorStateRequestAccess'}
            onClick={async () => {
                console.log('project_id', project_id);
                try {
                    await requestAccess({
                        variables: { project_id: project_id },
                    });
                    setSentAccessRequest(true);
                } catch (_e) {
                    const e = _e as Error;
                    H.track('Request Session Access Failed', {
                        error: e.toString(),
                    });
                    message.error(
                        <>
                            Failed to request session access, please try again.
                            If this keeps failing please message us on{' '}
                            <span
                                className={styles.intercomLink}
                                onClick={() => {
                                    window.Intercom(
                                        'showNewMessage',
                                        `I can't request session access. This is the error I'm getting: "${e}"`
                                    );
                                }}
                            >
                                Intercom
                            </span>
                            .
                        </>
                    );
                }
            }}
        >
            Request Access
        </Button>
    );
};

export default RequestAccess;
