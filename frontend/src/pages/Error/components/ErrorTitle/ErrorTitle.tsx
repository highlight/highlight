import React, { useEffect, useState } from 'react';

import { Field } from '../../../../components/Field/Field';
import { ErrorGroup, Maybe } from '../../../../graph/generated/schemas';
import { getHeaderFromError } from '../../ErrorPage';
import ErrorShareButton from '../ErrorShareButton/ErrorShareButton';
import styles from './ErrorTitle.module.scss';

interface Props {
    errorGroup:
        | Maybe<Pick<ErrorGroup, 'event' | 'type' | 'id' | 'is_public'>>
        | undefined;
    showShareButton?: boolean;
}

const ErrorTitle = ({ errorGroup, showShareButton = true }: Props) => {
    const [headerTextAsJson, setHeaderTextAsJson] = useState<null | any>(null);

    const headerText = getHeaderFromError(errorGroup?.event ?? []);

    useEffect(() => {
        if (headerText) {
            try {
                if (errorGroup?.event && errorGroup.event.length > 0) {
                    const json = JSON.parse(errorGroup.event.toString() || '');

                    if (Array.isArray(json)) {
                        setHeaderTextAsJson(json[0]);
                    }
                }
            } catch {
                setHeaderTextAsJson(null);
            }
        }
    }, [errorGroup?.event, headerText]);

    return (
        <header className={styles.header}>
            <div className={styles.topRow}>
                {!showShareButton ? (
                    <h3>{headerTextAsJson || headerText}</h3>
                ) : (
                    <h2>{headerTextAsJson || headerText}</h2>
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
