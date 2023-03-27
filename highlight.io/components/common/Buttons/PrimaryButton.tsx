import { ButtonProps } from 'antd'
import classNames from 'classnames'
import React from 'react'

import styles from './Buttons.module.scss'

export const PrimaryButton = ({ children, ...props }: React.PropsWithChildren<ButtonProps>) => {
  return (
    <a
      {...props}
      onClick={(e) => {
        if (window.dataLayer && props.href?.includes('app.highlight.io/sign_up')) {
          e.preventDefault()
          if (props.onClick) {
            props.onClick(e)
          }
          window.gtag('event', 'conversion', {
            send_to: 'AW-10833687189/_C5MCLfmoY0YEJXl860o',
            event_callback: function () {
              if (props.href) {
                window.location = props.href as any as Location
              }
            },
          })
          return false
        } else {
          if (props.onClick) {
            props.onClick(e)
          }
        }
      }}
      className={classNames(props.className, styles.genericButton, styles.primaryButton)}
    >
      {children}
    </a>
  )
}
