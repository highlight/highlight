import React from 'react';
import { useMarkErrorGroupAsResolvedMutation } from '../../../graph/generated/hooks';
import commonStyles from '../../../Common.module.scss';
import { useParams } from 'react-router-dom';

export const ResolveErrorButton: React.FC<{ resolved: boolean }> = ({
    resolved,
}) => {
    const { error_id } = useParams<{ error_id: string }>();
    const [markErrorGroupAsResolved] = useMarkErrorGroupAsResolvedMutation({
        refetchQueries: ['GetErrorGroup'],
    });
    return (
        <button
            onClick={() => {
                markErrorGroupAsResolved({
                    variables: {
                        id: error_id,
                        resolved: !resolved,
                    },
                });
            }}
            className={
                resolved
                    ? commonStyles.secondaryButton
                    : commonStyles.submitButton
            }
        >
            {resolved ? 'Unresolve error' : 'Resolve error'}
        </button>
    );
};
