import React, { useState } from 'react';
import LinesEllipsis from 'react-lines-ellipsis';

import { ErrorGroup, Maybe } from '../../../../graph/generated/schemas';
import styles from '../../ErrorPage.module.scss';
import { parseErrorDescription } from './utils/utils';

interface Props {
    errorGroup: Maybe<Pick<ErrorGroup, 'event'>> | undefined;
}

const ErrorDescription = ({ errorGroup }: Props) => {
    const [showExpandButton, setShowExpandButton] = useState(true);
    const [eventLineExpand, setEventLineExpand] = useState(false);

    const text = parseErrorDescription(errorGroup?.event);
    return (
        <>
            <LinesEllipsis
                text={text}
                maxLine={eventLineExpand ? Number.MAX_SAFE_INTEGER : 2}
                style={{ display: 'inline' }}
                onReflow={(c) => {
                    setShowExpandButton(!(c.text === text));
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
