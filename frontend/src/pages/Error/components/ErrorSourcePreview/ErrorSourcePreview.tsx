import { CodeBlock } from '@pages/Setup/CodeBlock/CodeBlock';
import React from 'react';

import styles from './ErrorSourcePreview.module.scss';

type ErrorSourcePreviewProps = {
    fileName: string | undefined;
    lineNumber: number | undefined;
    columnNumber: number | undefined;
    functionName: string | undefined;
    lineContent: string;
    linesBefore: string | undefined;
    linesAfter: string | undefined;
};

const normalize = (linesStr: string | undefined): string[] => {
    const arr = (linesStr ?? '')?.split('\n');
    const last = arr.pop();
    if (last !== undefined && last !== '') {
        arr.push(last);
    }
    return arr;
};

const LANGUAGE_MAP: { [K in string]: string } = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
};

const ErrorSourcePreview: React.FC<ErrorSourcePreviewProps> = ({
    fileName,
    lineNumber,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    columnNumber,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    functionName,
    lineContent,
    linesBefore,
    linesAfter,
}) => {
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

    if (!!minSpace) {
        for (let i = 0; i < text.length; i++) {
            text[i] = text[i].substring(minSpace);
        }
    }

    const extension = fileName?.split('.').pop();
    const language = (!!extension && LANGUAGE_MAP[extension]) || 'javascript';

    return (
        <span className={styles.codeBlockWrapper}>
            <CodeBlock
                className={styles.codeBlock}
                text={text.join('\n')}
                language={language}
                hideCopy
                showLineNumbers
                startingLineNumber={(lineNumber ?? 1) - before.length}
                lineProps={(ln) => {
                    if (ln === lineNumber) {
                        return {
                            style: {
                                backgroundColor: 'var(--color-purple-200)',
                                display: 'block',
                            },
                        };
                    }
                    return {
                        style: {
                            display: 'block',
                        },
                    };
                }}
                lineNumberStyle={{
                    paddingRight: '16px',
                    paddingLeft: '16px',
                }}
                wrapLines
            />
        </span>
    );
};

export default ErrorSourcePreview;
