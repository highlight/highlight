import { message } from 'antd';
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FaCopy } from 'react-icons/fa';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight as syntaxHighlighterTheme } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import styles from './CodeBlock.module.scss';

export const CodeBlock = ({
    text,
    onCopy,
    language,
}: {
    text: string;
    onCopy?: () => void;
    language: string;
}) => {
    return (
        <span className={styles.codeBlock}>
            <span className={styles.copyButton}>
                <CopyToClipboard
                    text={text}
                    onCopy={() => {
                        message.success('Copied Snippet', 5);
                        onCopy && onCopy();
                    }}
                >
                    <span className={styles.copyDiv}>
                        <FaCopy
                            style={{
                                position: 'absolute',
                                marginRight: 3,
                                height: 14,
                                width: 14,
                                color: 'var(--color-gray-500)',
                            }}
                        />
                    </span>
                </CopyToClipboard>
            </span>
            {/* <code className={styles.codeBlockWrapper}>{text}</code> */}
            <SyntaxHighlighter
                language={language}
                style={syntaxHighlighterTheme}
            >
                {text}
            </SyntaxHighlighter>
        </span>
    );
};
