import * as Ariakit from '@ariakit/react'

import { Box } from '../Box/Box'
import { Button, ButtonProps } from '../Button/Button'
import { ButtonIcon } from '../ButtonIcon/ButtonIcon'
import { IconSolidX } from '../icons'
import { Stack } from '../Stack/Stack'
import * as styles from './styles.css'

type ModalProps = React.PropsWithChildren<Ariakit.DialogProviderProps> & {
	hideOnInteractOutside?: Ariakit.DialogProps['hideOnInteractOutside']
	unmountOnHide?: Ariakit.DialogProps['unmountOnHide']
	width?: number
	onClose?: () => void
}

type ModalComponent = React.FC<ModalProps> & {
	Header: typeof ModalHeader
	Body: typeof ModalBody
	Footer: typeof ModalFooter
	CancelButton: typeof CancelButton
	useStore: typeof Ariakit.useDialogStore
	useContext: typeof Ariakit.useDialogContext
}

export const Modal: ModalComponent = ({
	children,
	hideOnInteractOutside,
	unmountOnHide,
	width = 360,
	onClose,
	...props
}: ModalProps) => {
	return (
		<Ariakit.DialogProvider {...props}>
			<Ariakit.Dialog
				modal
				render={
					<Box
						border="divider"
						borderRadius="8"
						boxShadow="small"
						overflow="hidden"
						cssClass={styles.modal}
						style={{ width }}
					/>
				}
				hideOnInteractOutside={hideOnInteractOutside}
				unmountOnHide={unmountOnHide}
				onClose={onClose}
				getPersistentElements={() => {
					// Provides a mechanism to allow other elements to be interacted with
					// when the modal is open. Important for things like toasts messages.
					return Array.from(
						document.querySelectorAll<HTMLElement>(
							'[data-persistent-element]',
						),
					).filter((el): el is HTMLElement => el != null)
				}}
				backdrop={
					<Box
						// TODO: Hard-coding to match mock until scrim variable is updated.
						style={{
							backgroundColor: 'rgba(111, 110, 119, 0.48)',
						}}
					/>
				}
			>
				{children}
			</Ariakit.Dialog>
		</Ariakit.DialogProvider>
	)
}

const ModalHeader: React.FC<React.PropsWithChildren> = ({ children }) => {
	const modalStore = Ariakit.useDialogContext()!

	return (
		<Box
			py="6"
			px="8"
			display="flex"
			justifyContent="space-between"
			alignItems="center"
			bb="divider"
			borderTopLeftRadius="8"
			borderTopRightRadius="8"
			backgroundColor="raised"
			position="relative"
		>
			<Stack align="center" direction="row" gap="6">
				{children}
			</Stack>

			<ButtonIcon
				icon={<IconSolidX />}
				size="xSmall"
				emphasis="low"
				kind="secondary"
				onClick={modalStore.hide}
				style={{ position: 'absolute', top: 6, right: 8 }}
			/>
		</Box>
	)
}

const ModalBody: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<Box backgroundColor="white" padding="12">
			{children}
		</Box>
	)
}

type ModalFooterProps = React.PropsWithChildren & {
	actions?: React.ReactNode
}

const ModalFooter: React.FC<ModalFooterProps> = ({ actions, children }) => {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="space-between"
			padding="4"
			borderTop="divider"
			borderBottomLeftRadius="8"
			borderBottomRightRadius="8"
			backgroundColor="raised"
		>
			<Box display="flex" alignItems="center" flexDirection="row">
				{children}
			</Box>

			<Stack gap="4" direction="row">
				{actions}
			</Stack>
		</Box>
	)
}

const CancelButton: React.FC<ButtonProps> = (props) => {
	const dialogStore = Ariakit.useDialogContext()!

	return (
		<Button
			onClick={dialogStore.hide}
			kind="secondary"
			emphasis="high"
			{...props}
		>
			Cancel
		</Button>
	)
}

Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Footer = ModalFooter
Modal.CancelButton = CancelButton
Modal.useStore = Ariakit.useDialogStore
Modal.useContext = Ariakit.useDialogContext
