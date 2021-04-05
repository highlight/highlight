import React, { useState } from 'react';
import LinesEllipsis from 'react-lines-ellipsis';
import { ErrorGroup, Maybe } from '../../../../graph/generated/schemas';
import styles from '../../ErrorPage.module.scss';

interface Props {
    errorGroup: Maybe<ErrorGroup> | undefined;
}

const ErrorDescription = ({ errorGroup }: Props) => {
    const [showExpandButton, setShowExpandButton] = useState(true);
    const [eventLineExpand, setEventLineExpand] = useState(false);

    return (
        <>
            <LinesEllipsis
                text={errorGroup?.event.join() ?? ''}
                maxLine={eventLineExpand ? Number.MAX_SAFE_INTEGER : 2}
                style={{ display: 'inline' }}
                onReflow={(c) => {
                    setShowExpandButton(!(c.text === errorGroup?.event.join()));
                }}
                className={styles.eventText}
            />
            {showExpandButton && (
                <span
                    className={styles.expandButton}
                    onClick={() => setEventLineExpand(true)}
                >
                    {' '}
                    show more
                </span>
            )}
        </>
    );
};

export default ErrorDescription;
