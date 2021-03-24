import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import GoToButton from '../../../../../../../components/Button/GoToButton';
import { ErrorObject } from '../../../../../../../graph/generated/schemas';
import { ErrorsPageHistoryState } from '../../ErrorsPage';
import styles from './ErrorCard.module.scss';

interface Props {
    error: ErrorObject;
    /** The index of this error card relative to the other error cards. */
    index: number;
}

const ErrorCard = ({ error, index }: Props) => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const history = useHistory<ErrorsPageHistoryState>();

    return (
        <div key={error.id} className={styles.errorCard}>
            <div>
                <div className={styles.header}>
                    <h4>{error.type}</h4>
                    <p>
                        {error.source} at line {error.line_number}:
                        {error.column_number}
                    </p>
                </div>
                <div>
                    <p className={styles.description}>
                        {JSON.parse(error.event)[0]}
                    </p>
                </div>
            </div>
            <div>
                <GoToButton
                    className={styles.goToButton}
                    onClick={() => {
                        // Sets the index so if the user navigates back to the player page, the error card they clicked on will be in view.
                        history.replace(window.location.pathname, {
                            errorCardIndex: index,
                        });
                        history.push(
                            `/${organization_id}/errors/${error.error_group_id}`
                        );
                    }}
                />
            </div>
        </div>
    );
};

export default ErrorCard;
