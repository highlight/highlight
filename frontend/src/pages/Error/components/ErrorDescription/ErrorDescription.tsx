import Card from '@components/Card/Card';
import React, { useEffect, useState } from 'react';
import ReactJson from 'react-json-view';
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
    const [textAsJson, setTextAsJson] = useState<null | any>(false);

    const text = parseErrorDescription(errorGroup?.event);

    useEffect(() => {
        if (text) {
            try {
                console.log(JSON.parse(text));
                const json = JSON.parse(text);
                setTextAsJson(json);
            } catch {
                setTextAsJson(null);
            }
        }
    }, [text]);

    return (
        <>
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
                <Card>
                    <ReactJson
                        src={textAsJson}
                        collapsed={1}
                        displayDataTypes={false}
                        collapseStringsAfterLength={100}
                        iconStyle="square"
                        quotesOnKeys={false}
                        name={null}
                    />
                </Card>
            )}
        </>
    );
};

export default ErrorDescription;
