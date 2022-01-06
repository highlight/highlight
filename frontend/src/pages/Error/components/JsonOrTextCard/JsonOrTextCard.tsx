import Card from '@components/Card/Card';
import JsonViewer from '@components/JsonViewer/JsonViewer';
import React, { useEffect, useState } from 'react';
import LinesEllipsis from 'react-lines-ellipsis';

import styles from '../../ErrorPage.module.scss';

interface Props {
    jsonOrText: string;
    title?: string;
}

const JsonOrTextCard = ({ jsonOrText, title }: Props) => {
    const [showExpandButton, setShowExpandButton] = useState(true);
    const [eventLineExpand, setEventLineExpand] = useState(false);
    const [textAsJson, setTextAsJson] = useState<null | any>(null);

    useEffect(() => {
        if (jsonOrText) {
            try {
                const json = JSON.parse(jsonOrText);
                if (typeof json === 'object') {
                    setTextAsJson(json);
                }
            } catch {
                setTextAsJson(null);
            }
        }
    }, [jsonOrText]);

    return (
        <Card
            title={
                !title
                    ? undefined
                    : textAsJson === null
                    ? title
                    : `${title} as JSON`
            }
        >
            {textAsJson === null ? (
                <>
                    <LinesEllipsis
                        text={jsonOrText}
                        maxLine={eventLineExpand ? Number.MAX_SAFE_INTEGER : 2}
                        style={{ display: 'inline' }}
                        onReflow={(c) => {
                            setShowExpandButton(!(c.text === jsonOrText));
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
                <JsonViewer src={textAsJson} collapsed={2} />
            )}
        </Card>
    );
};

export default JsonOrTextCard;
