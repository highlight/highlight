import Card from '@components/Card/Card';
import JsonViewer from '@components/JsonViewer/JsonViewer';
import { parseOptionalJSON } from '@util/string';
import React, { useState } from 'react';
import LinesEllipsis from 'react-lines-ellipsis';

import styles from '../../ErrorPage.module.scss';

interface Props {
    jsonOrText: string;
    title?: string;
}

const JsonOrTextCard = ({ jsonOrText, title }: Props) => {
    const [showExpandButton, setShowExpandButton] = useState(true);
    const [eventLineExpand, setEventLineExpand] = useState(false);
    const content = parseOptionalJSON(jsonOrText || '');
    return (
        <Card
            title={
                !title
                    ? undefined
                    : typeof content !== 'object'
                    ? title
                    : `${title} as JSON`
            }
        >
            {typeof content !== 'object' ? (
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
                <JsonViewer src={content} collapsed={2} />
            )}
        </Card>
    );
};

export default JsonOrTextCard;
