import React from 'react';

import { Field } from '../../../../components/Field/Field';
import { ErrorGroup, Maybe } from '../../../../graph/generated/schemas';
import { getHeaderFromError } from '../../ErrorPage';
import ErrorShareButton from '../ErrorShareButton/ErrorShareButton';
import styles from './ErrorTitle.module.scss';

interface Props {
    errorGroup: Maybe<Pick<ErrorGroup, 'event' | 'type' | 'id'>> | undefined;
    showShareButton?: boolean;
}

const ErrorTitle = ({ errorGroup, showShareButton = true }: Props) => {
    const headerText = getHeaderFromError(errorGroup?.event ?? []);

    return (
        <header className={styles.header}>
            <div className={styles.topRow}>
                {!showShareButton ? (
                    <h3>{headerText}</h3>
                ) : (
                    <h2>{headerText}</h2>
                )}
                {showShareButton && (
                    <ErrorShareButton errorGroup={errorGroup} />
                )}
            </div>
            <Field
                k={'mechanism'}
                v={errorGroup?.type || 'window.onerror'}
                color={'warning'}
            />
        </header>
    );
};

export default ErrorTitle;
