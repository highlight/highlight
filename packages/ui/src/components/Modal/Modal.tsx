import * as Ariakit from '@ariakit/react'
import { Button, ButtonProps } from '../Button/Button'
import { ButtonIcon } from '../ButtonIcon/ButtonIcon'
import { IconSolidX } from '../icons'
import { Stack } from '../Stack/Stack'
import { Box } from '../Box/Box'

import * as styles from './styles.css'

type ModalProps = React.PropsWithChildren<Ariakit.DialogProviderProps> & {
	hideOnInteractOutside?: boolean
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
	...props
}: ModalProps) => {
	return (
		<Ariakit.DialogProvider {...props}>
			<Ariakit.Dialog
				render={
					<Box
						border="divider"
						borderRadius="8"
						boxShadow="small"
						style={{ width: 360 }}
					/>
				}
				modal
				hideOnInteractOutside={hideOnInteractOutside}
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
	return <Box padding="12">{children}</Box>
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
