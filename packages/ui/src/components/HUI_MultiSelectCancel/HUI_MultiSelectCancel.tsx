import React, { useState } from 'react'
import { Box } from '../Box/Box'
import { Listbox } from '@headlessui/react'

import * as styles from './styles.css'

/**
 * Behavior:
 * (1) User is presented a list of options. By default, state is an empty array of strings.
 * (2) MultiSelect: add/remove one or more values to/from state
 * (3) Cancel: press 'x' button to set state back to default
 */

// NOTE - state type interfaces would be different each time, behavior might be slightly different
// feels like premature optimizaiton to factor out a component rn
// to get styling, can we just wrap inline components in a Box with sprinkles props?

interface Option {
	id: number
	name: string
}

type Props = React.PropsWithChildren<
	styles.Variants & {
		options: Option[]
		state: Option
		setState: (o: Option) => void
	}
>

export const HUI_MultiSelectCancel: React.FC<Props> = ({
	children,
	options,
	state,
	setState,
	...props
}) => {
	return (
		<Box cssClass={styles.variants({ ...props })}>
			<Listbox value={state} onChange={setState}>
				<Listbox.Button>{state.name}</Listbox.Button>
				<Listbox.Options>
					{options.map((o) => (
						<Listbox.Option key={o.id} value={o.name}>
							{o.name}
						</Listbox.Option>
					))}
				</Listbox.Options>
			</Listbox>
		</Box>
	)
}
