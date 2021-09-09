import React from 'react';

import { Field } from '../../../../components/Field/Field';
import { ErrorGroup, Maybe } from '../../../../graph/generated/schemas';
import { getHeaderFromError } from '../../ErrorPage';
import ErrorShareButton from '../ErrorShareButton/ErrorShareButton';
import styles from './ErrorTitle.module.scss';

interface Props {
    errorGroup: Maybe<ErrorGroup> | undefined;
}

const ErrorTitle = ({ errorGroup }: Props) => {
    return (
        <header className={styles.header}>
            <div className={styles.topRow}>
                <div>
                    <h2>{getHeaderFromError(errorGroup?.event ?? [])}</h2>
                </div>
                <ErrorShareButton errorGroup={errorGroup} />
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
