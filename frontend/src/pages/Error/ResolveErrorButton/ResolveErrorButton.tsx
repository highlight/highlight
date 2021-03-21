import React from 'react';
import { useMarkErrorGroupAsResolvedMutation } from '../../../graph/generated/hooks';
import commonStyles from '../../../Common.module.scss';
import { useParams } from 'react-router-dom';
import { CircularSpinner } from '../../../components/Loading/Loading';
import { message } from 'antd';

export const ResolveErrorButton: React.FC<{
    resolved: boolean;
    loading: boolean;
}> = ({ resolved, loading }) => {
    const { error_id } = useParams<{ error_id: string }>();
    const [markErrorGroupAsResolved] = useMarkErrorGroupAsResolvedMutation();
    return (
        <button
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
                <CircularSpinner style={{ fontSize: 18, color: 'white' }} />
            ) : resolved ? (
                'Mark as Unresolved'
            ) : (
                'Mark as Resolved'
            )}
        </button>
    );
};
