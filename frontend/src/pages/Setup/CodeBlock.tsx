import React from 'react'

import styles from './SetupPage.module.css'
import { message } from 'antd'
import CopyToClipboard from 'react-copy-to-clipboard'

import { FaCopy } from 'react-icons/fa'

export const CodeBlock = ({
    text,
    onCopy,
}: {
    text: string
    onCopy?: () => void
}) => {
    return (
        <>
            <div style={{ position: 'relative' }}>
                <div className={styles.copyButton}>
                    <CopyToClipboard
                        text={text}
                        onCopy={() => {
                            message.success('Copied Snippet', 5)
                            onCopy && onCopy()
                        }}
                    >
                        <div className={styles.copyDiv}>
                            <FaCopy
                                style={{
                                    position: 'absolute',
                                    marginRight: 3,
                                    height: 14,
                                    width: 14,
                                    color: 'grey',
                                }}
                            />
                        </div>
                    </CopyToClipboard>
                </div>
                <div className={styles.codeBlockWrapper}>{text}</div>
            </div>
        </>
    )
}
