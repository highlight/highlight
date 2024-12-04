import { Meta } from '@storybook/react'

import { Button } from '../Button/Button'
import { IconSolidInformationCircle, IconSolidUserAdd } from '../icons'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import { Modal } from './Modal'

export default {
	title: 'Components/Modal',
	component: Modal,
} as Meta<typeof Modal>

export const Basic = () => (
	<Modal defaultOpen hideOnInteractOutside={false}>
		<Modal.Header>
			<IconSolidUserAdd />
			<Text size="xxSmall" color="moderate">
				Invite users to {'{Workspace}'}
			</Text>
		</Modal.Header>
		<Modal.Body>
			<Text color="moderate">
				Lorem ipsum, dolor sit amet consectetur adipisicing elit.
				Deleniti ipsam eum excepturi inventore fugiat, impedit enim,
				quibusdam maxime maiores repellendus ut facilis eos veritatis
				ipsa similique architecto. Vel, consequatur earum?
			</Text>
		</Modal.Body>
		<Modal.Footer actions={<Modal.CancelButton>Cancel</Modal.CancelButton>}>
			<Button kind="secondary" emphasis="low">
				<Stack align="center" direction="row" gap="4">
					<IconSolidInformationCircle />
					Learn more
				</Stack>
			</Button>
		</Modal.Footer>
	</Modal>
)
