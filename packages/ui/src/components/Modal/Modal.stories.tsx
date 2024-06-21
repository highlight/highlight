import { Button } from '@/components/Button/Button'
import { ButtonLink } from '@/components/ButtonLink/ButtonLink'
import {
	IconSolidInformationCircle,
	IconSolidUserAdd,
} from '@/components/icons'
import { Stack } from '@/components/Stack/Stack'
import { Meta } from '@storybook/react'
import { Box } from '../Box/Box'
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
