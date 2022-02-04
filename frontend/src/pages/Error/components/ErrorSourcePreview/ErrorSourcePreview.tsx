import { CodeBlock } from '@pages/Setup/CodeBlock/CodeBlock';
import React from 'react';

import styles from './ErrorSourcePreview.module.scss';

type ErrorSourcePreviewProps = {
    lineNumber: number | undefined;
    lineContent: string | undefined;
    linesBefore?: string | undefined;
    linesAfter?: string | undefined;
};

const normalize = (linesStr: string | undefined): string[] => {
    const arr = (linesStr ?? '')?.split('\n');
    const last = arr.pop();
    if (last !== undefined && last !== '') {
        arr.push(last);
    }
    return arr;
};

const ErrorSourcePreview: React.FC<ErrorSourcePreviewProps> = ({
    lineNumber,
    lineContent,
    linesBefore,
    linesAfter,
}) => {
    if (lineContent === undefined) {
        return null;
    }

    const before = normalize(linesBefore);
    const line = normalize(lineContent);
    const after = normalize(linesAfter);
    const text = before.concat(line).concat(after);

    // Remove preceding spaces in case the snippet has a lot of indentation
    let minSpace: number | undefined;
    for (const line of text) {
        let spaceCount = 0;
        let nonSpaceSeen = false;
        for (const c of line) {
            if (c === ' ' || c === '\t') {
                spaceCount++;
            } else {
                nonSpaceSeen = true;
                break;
            }
        }
        if (nonSpaceSeen && (minSpace === undefined || spaceCount < minSpace)) {
            minSpace = spaceCount;
        }
    }

    if (minSpace !== undefined) {
        for (let i = 0; i < text.length; i++) {
            text[i] = text[i].substring(minSpace);
        }
    }

    return (
        <CodeBlock
            className={styles.codeBlock}
            text={text.join('\n')}
            language={'javascript'}
            showLineNumbers
            startingLineNumber={(lineNumber ?? 1) - before.length}
            lineProps={(ln) => {
                if (ln === lineNumber) {
                    return { style: { backgroundColor: '#ffecec' } };
                }
                return {};
            }}
        />
    );
};

export default ErrorSourcePreview;
