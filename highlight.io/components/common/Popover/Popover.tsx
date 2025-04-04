import { useRef } from 'react'
import { DismissButton, FocusScope, useOverlay } from 'react-aria'

export default function Popover(props: any) {
	let ref = useRef(undefined)
	let {
		popoverRef = ref,
		isOpen,
		onClose,
		children,
		popoverClassName,
	} = props

	// Handle events that should cause the popup to close,
	// e.g. blur, clicking outside, or pressing the escape key.
	let { overlayProps } = useOverlay(
		{
			isOpen,
			onClose,
			shouldCloseOnBlur: true,
			isDismissable: true,
		},
		popoverRef,
	)

	// Add a hidden <DismissButton> component at the end of the popover
	// to allow screen reader users to dismiss the popup easily.
	return (
		<FocusScope>
			<div
				{...overlayProps}
				ref={popoverRef}
				className={popoverClassName}
			>
				{children}
				<DismissButton onDismiss={onClose} />
			</div>
		</FocusScope>
	)
}
