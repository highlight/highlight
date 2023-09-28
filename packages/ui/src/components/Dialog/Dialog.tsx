import React from 'react'
import * as Ariakit from '@ariakit/react'

type Props = React.PropsWithChildren & Ariakit.DialogProps

type DialogComponent = React.FC<Props> & {
	useStore: typeof Ariakit.useDialogStore
}

export const Dialog: DialogComponent = ({ children, ...props }: Props) => {
	return <Ariakit.Dialog {...props}>{children}</Ariakit.Dialog>
}

Dialog.useStore = Ariakit.useDialogStore
