import React from 'react';
// eslint-disable-next-line no-restricted-imports
import Highlighter, { HighlighterProps } from 'react-highlight-words';

import styles from './TextHighlighter.module.scss';

type Props = HighlighterProps;

const TextHighlighter = ({ textToHighlight = '', ...props }: Props) => {
    return (
        <Highlighter
            {...props}
            highlightClassName={styles.highlighterStyles}
            autoEscape={true}
            textToHighlight={textToHighlight}
        />
    );
};

export default TextHighlighter;
