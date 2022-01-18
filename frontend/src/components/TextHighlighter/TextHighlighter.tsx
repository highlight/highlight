import React from 'react';
// eslint-disable-next-line no-restricted-imports
import Highlighter, { HighlighterProps } from 'react-highlight-words';

import styles from './TextHighlighter.module.scss';

export type TextHighlighterProps = HighlighterProps;

const TextHighlighter = (props: TextHighlighterProps) => {
    return (
        <Highlighter
            {...props}
            highlightClassName={styles.highlighterStyles}
            autoEscape={true}
        />
    );
};

export default TextHighlighter;
