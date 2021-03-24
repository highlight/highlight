import React from 'react';
import { useMarkErrorGroupAsResolvedMutation } from '../../../graph/generated/hooks';
import commonStyles from '../../../Common.module.scss';
import { useParams } from 'react-router-dom';
import { CircularSpinner } from '../../../components/Loading/Loading';
import { message } from 'antd';

export const ResolveErrorButton: React.FC<{
    resolved: boolean;
    loading: boolean;
    hideResolvedErrorsSearchParameter?: boolean;
}> = ({ resolved, loading, hideResolvedErrorsSearchParameter = false }) => {
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
                    update(cache) {
                        // Updates Apollo Client's cache to remove the error group. We only do this if the user has the "Hide resolved errors" search parameter enabled and the user is resolving an error group.
                        if (hideResolvedErrorsSearchParameter && !resolved) {
                            cache.modify({
                                fields: {
                                    error_groups(
                                        existingErrorGroupsRef,
                                        { readField }
                                    ) {
                                        return {
                                            ...existingErrorGroupsRef,
                                            error_groups: existingErrorGroupsRef.error_groups.filter(
                                                (errorGroupRef: any) =>
                                                    error_id !==
                                                    readField(
                                                        'id',
                                                        errorGroupRef
                                                    )
                                            ),
                                        };
                                    },
                                },
                            });
                        }
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
