import classNames from 'classnames'
import ReactMarkdown from 'react-markdown'

import styles from './MarkdownRender.module.scss'

export const MarkdownRender = ({ content }: { content: string }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 840,
        }}
      >
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => <p className={styles.paragraph} {...props}></p>,
            h1: ({ node, ...props }) => {
              return <h1 className={classNames(styles.heading, styles.h1)} {...props}></h1>
            },
            h2: ({ node, ...props }) => {
              return <h2 className={styles.heading} {...props}></h2>
            },
            h3: ({ node, ...props }) => {
              return <h3 className={styles.heading} {...props}></h3>
            },
            h4: ({ node, ...props }) => {
              return <h4 className={styles.heading} {...props}></h4>
            },
            h5: ({ node, ...props }) => {
              return <h5 className={styles.heading} {...props}></h5>
            },
            h6: ({ node, ...props }) => {
              return <h6 className={styles.heading} {...props}></h6>
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
