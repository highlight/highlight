
import React from 'react'
import { Callout, CalloutProps } from '@highlight-run/ui/components/Callout/Callout'
import analytics from '@util/analytics'
import { useSessionStorage } from 'react-use'

export type CustomAlertProps = {
  trackingId: string
  closable?: boolean
  shouldAlwaysShow?: boolean
} & Pick<CalloutProps, 'title' | 'kind' | 'children' | 'style' | 'className'>

const CustomAlert = ({
  trackingId,
  closable,
  shouldAlwaysShow = false,
  kind = 'info',
  title,
  children,
  ...props
}: CustomAlertProps) => {
  const [temporarilyHideAlert, setTemporarilyHideAlert] = useSessionStorage(
    `highlightHideAlert-${trackingId}`,
    false,
  )

  if (temporarilyHideAlert && !shouldAlwaysShow) {
    return null
  }

  return (
    <Callout
      kind={kind}
      title={title}
      handleCloseClick={closable !== false ? () => {
        analytics.track(`AlertClose-${trackingId}`)
        setTemporarilyHideAlert(true)
      } : undefined}
      {...props}
    >
      {children}
    </Callout>
  )
}

export default CustomAlert
