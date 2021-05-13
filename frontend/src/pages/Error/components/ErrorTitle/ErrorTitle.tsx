import React from 'react';

import { Field } from '../../../../components/Field/Field';
import { ErrorGroup, Maybe } from '../../../../graph/generated/schemas';
import { getHeaderFromError } from '../../ErrorPage';
import styles from '../../ErrorPage.module.scss';

interface Props {
    errorGroup: Maybe<ErrorGroup> | undefined;
}

const ErrorTitle = ({ errorGroup }: Props) => {
    return (
        <>
            <div className={styles.title}>
                {getHeaderFromError(errorGroup?.event ?? [])}
            </div>
            <Field
                k={'mechanism'}
                v={errorGroup?.type || 'window.onerror'}
                color={'warning'}
            />
        </>
    );
};

export default ErrorTitle;
