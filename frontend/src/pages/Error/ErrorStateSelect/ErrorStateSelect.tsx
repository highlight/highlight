import { message } from 'antd';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import Select from '../../../components/Select/Select';
import { useUpdateErrorGroupStateMutation } from '../../../graph/generated/hooks';
import { ErrorState } from '../../../graph/generated/schemas';
import styles from './ErrorStateSelect.module.scss';

const ErrorStateOptions = Object.keys(ErrorState).map((key) => ({
    displayValue: `${key}`,
    value: key.toUpperCase(),
    id: key.toUpperCase(),
}));

export const ErrorStateSelect: React.FC<{
    state: ErrorState;
}> = ({ state }) => {
    const { error_id } = useParams<{ error_id: string }>();
    const [updateErrorGroupState] = useUpdateErrorGroupStateMutation();
    const [loading, setLoading] = useState(false);

    return (
        <Select
            options={ErrorStateOptions}
            className={styles.select}
            defaultValue={state}
            onChange={async (newState: ErrorState) => {
                setLoading(true);
                await updateErrorGroupState({
                    variables: { id: error_id, state: newState },
                });
                setLoading(false);

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
            }}
            loading={loading}
        />
    );
};
