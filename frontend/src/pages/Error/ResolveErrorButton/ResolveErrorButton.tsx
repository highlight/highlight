import { message } from 'antd';
import React from 'react';
import { useParams } from 'react-router-dom';

import commonStyles from '../../../Common.module.scss';
import Button from '../../../components/Button/Button/Button';
import { CircularSpinner } from '../../../components/Loading/Loading';
import { useMarkErrorGroupAsResolvedMutation } from '../../../graph/generated/hooks';

export const ResolveErrorButton: React.FC<{
    resolved: boolean;
    loading: boolean;
}> = ({ resolved, loading }) => {
    const { error_id } = useParams<{ error_id: string }>();
    const [markErrorGroupAsResolved] = useMarkErrorGroupAsResolvedMutation();
    return (
        <Button
            trackingId="ResolveError"
            type="primary"
            onClick={() => {
                markErrorGroupAsResolved({
                    variables: {
                        id: error_id,
                        resolved: !resolved,
                    },
                })
                    .then(() => {
                        message.success('Updated error status!', 3);
                    })
                    .catch(() => {
                        message.error('Error updating error status!', 3);
                    });
            }}
            className={
                resolved
                    ? commonStyles.secondaryButton
                    : commonStyles.submitButton
            }
            style={{ outline: 'none' }}
        >
            {loading ? (
                <CircularSpinner
                    style={{
                        fontSize: 18,
                        color: 'var(--text-primary-inverted)',
                    }}
                />
            ) : resolved ? (
                'Mark as Unresolved'
            ) : (
                'Mark as Resolved'
            )}
        </Button>
    );
};
