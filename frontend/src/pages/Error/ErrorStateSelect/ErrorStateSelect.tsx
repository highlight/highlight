import { message } from 'antd';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';

import Select from '../../../components/Select/Select';
import { useUpdateErrorGroupStateMutation } from '../../../graph/generated/hooks';
import { ErrorState } from '../../../graph/generated/schemas';
import styles from './ErrorStateSelect.module.scss';

/**
 * The possible states for an `ErrorGroup`.
 */
export const ErrorStateOptions = Object.keys(ErrorState).map((key) => ({
    displayValue: `${key}`,
    value: key.toUpperCase(),
    id: key.toUpperCase(),
}));

export const ErrorStateSelect: React.FC<{
    state?: ErrorState;
    loading: boolean;
}> = ({ state: initialErrorState, loading }) => {
    const { error_id } = useParams<{ error_id: string }>();
    const [
        updateErrorGroupState,
        { loading: updateLoading },
    ] = useUpdateErrorGroupStateMutation();
    const [action, setAction] = useQueryParam('action', StringParam);

    // Sets the state based on the query parameters. This is used for the Slack deep-linked messages.
    useEffect(() => {
        if (action) {
            const castedAction = action.toUpperCase() as ErrorState;
            if (Object.values(ErrorState).includes(castedAction)) {
                updateErrorGroupState({
                    variables: { id: error_id, state: castedAction },
                });
                showStateUpdateMessage(castedAction);
            }
            setAction(undefined);
        }
    }, [action, error_id, setAction, updateErrorGroupState]);

    return (
        <Select
            options={ErrorStateOptions}
            className={styles.select}
            value={initialErrorState}
            onChange={async (newState: ErrorState) => {
                await updateErrorGroupState({
                    variables: { id: error_id, state: newState },
                });

                showStateUpdateMessage(newState);
            }}
            loading={updateLoading || loading}
        />
    );
};

const showStateUpdateMessage = (newState: ErrorState) => {
    let displayMessage = '';
    switch (newState) {
        case ErrorState.Open:
            displayMessage = `This error is set to Open. You will receive alerts when a new error gets thrown.`;
            break;
        case ErrorState.Ignored:
            displayMessage = `This error is set to Ignored. You will not receive any alerts even if a new error gets thrown.`;
            break;
        case ErrorState.Resolved:
            displayMessage = `This error is set to Resolved. You will receive alerts when a new error gets thrown.`;
            break;
    }

    message.success(displayMessage, 10);
};
