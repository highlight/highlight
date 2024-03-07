import {
	Box,
	ButtonIcon,
	Dialog,
	IconSolidArrowsExpand,
	IconSolidX,
	Stack,
} from '@highlight-run/ui/components'
import { useNavigate } from 'react-router-dom'

type Props = {
	path: string
}

export const PanelHeader: React.FC<React.PropsWithChildren<Props>> = ({
	children,
	path,
}) => {
	const navigate = useNavigate()
	const dialogStore = Dialog.useContext()!

	return (
		<Box
			py="6"
			px="8"
			bb="dividerWeak"
			display="flex"
			alignItems="center"
			justifyContent="space-between"
		>
			<ButtonIcon
				icon={<IconSolidArrowsExpand />}
				emphasis="low"
				kind="secondary"
				onClick={() => {
					navigate(path)
				}}
			/>

			<Stack gap="4" direction="row" alignItems="center">
				{children}

				<ButtonIcon
					icon={<IconSolidX />}
					emphasis="low"
					kind="secondary"
					onClick={() => {
						dialogStore.hide()
					}}
				/>
			</Stack>
		</Box>
	)
}
