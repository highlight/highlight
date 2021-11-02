import useLocalStorage from '@rehooks/local-storage';
import { message } from 'antd';
import React, { useEffect } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FaCopy } from 'react-icons/fa';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {
    atomOneDark,
    atomOneLight,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';

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
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>(
        'highlightTheme',
        'light'
    );
    const htmlElement = document.querySelector('html');

    useEffect(() => {
        console.log({ htmlElement });
        if (htmlElement) {
            const currentTheme = htmlElement.dataset.theme;
            if (
                currentTheme &&
                (currentTheme === 'light' || currentTheme === 'dark')
            ) {
                setTheme(currentTheme);
            }
        }
    }, [htmlElement, setTheme]);

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
            <SyntaxHighlighter
                language={language}
                style={theme === 'light' ? atomOneLight : atomOneDark}
            >
                {text}
            </SyntaxHighlighter>
        </span>
    );
};
