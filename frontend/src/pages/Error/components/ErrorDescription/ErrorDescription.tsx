import Card from '@components/Card/Card';
import JsonViewer from '@components/JsonViewer/JsonViewer';
import React, { useEffect, useState } from 'react';
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
    const [textAsJson, setTextAsJson] = useState<null | any>(null);

    const text = parseErrorDescription(errorGroup?.event);

    useEffect(() => {
        if (text) {
            try {
                const json = JSON.parse(text);
                if (typeof json === 'object') {
                    setTextAsJson(json);
                }
            } catch {
                setTextAsJson(null);
            }
        }
    }, [text]);

    return (
        <Card title={textAsJson === null ? 'Error Body' : 'Error Body as JSON'}>
            {textAsJson === null ? (
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
            ) : (
                <JsonViewer src={textAsJson} collapsed={1} />
            )}
        </Card>
    );
};

export default ErrorDescription;
