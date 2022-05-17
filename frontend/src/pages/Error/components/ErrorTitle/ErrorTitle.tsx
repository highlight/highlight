import Tag from '@components/Tag/Tag';
import { ErrorGroup, Maybe } from '@graph/schemas';
import { getErrorTitle } from '@util/errors/errorUtils';
import React, { useEffect, useState } from 'react';

import { getHeaderFromError } from '../../ErrorPage';
import styles from './ErrorTitle.module.scss';

interface Props {
    errorGroup:
        | Maybe<Pick<ErrorGroup, 'event' | 'type' | 'secure_id' | 'is_public'>>
        | undefined;
    showShareButton?: boolean;
}

const ErrorTitle = ({ errorGroup, showShareButton = true }: Props) => {
    const [headerTextAsJson, setHeaderTextAsJson] = useState<null | any>(null);

    const headerText = getHeaderFromError(errorGroup?.event ?? []);

    useEffect(() => {
        if (headerText) {
            if (errorGroup?.event) {
                const title = getErrorTitle(errorGroup.event);
                if (title) {
                    setHeaderTextAsJson(title);
                } else {
                    setHeaderTextAsJson(null);
                }
            } else {
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
            </div>
            <div className={styles.secondRow}>
                {errorGroup?.type && (
                    <Tag
                        infoTooltipText="This is where the error was thrown."
                        backgroundColor="var(--color-orange-300)"
                    >
                        {errorGroup.type}
                    </Tag>
                )}
            </div>
        </header>
    );
};

export default ErrorTitle;
