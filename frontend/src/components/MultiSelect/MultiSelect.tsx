import { Listbox } from '@headlessui/react'
import { Box, IconSolidCheckCircle, IconSolidX } from '@highlight-run/ui'
import React from 'react'

import * as styles from './MultiSelect.css'

interface Input {
	id: string
	name: string
	render?: string
}

type Props<T extends Input> = React.PropsWithChildren & {
	options: T[]
	onChange?: (selected: T[]) => void
	showCancel?: boolean
}

export const MultiSelect = function <T extends Input>({
	children,
	options,
	onChange,
	showCancel,
}: Props<T>) {
	const [selected, setSelected] = React.useState<T[]>([])

	React.useEffect(() => {
		if (onChange) {
			onChange(selected)
		}
	}, [onChange, selected])

	return (
		<Box cssClass={styles.container}>
			<Listbox multiple value={selected} onChange={(v) => setSelected(v)}>
				<Listbox.Button>{selected.map((s) => s.name)}</Listbox.Button>
				<Listbox.Options>
					{showCancel && (
						<div onClick={() => setSelected([])}>
							<IconSolidX />
						</div>
					)}
					{options.map((o) => {
						return (
							<Listbox.Option
								key={o.id}
								value={o}
								as={React.Fragment}
							>
								{({ active, selected }) => (
									<Box display="flex">
										{selected && <IconSolidCheckCircle />}
										<div
											className={styles.variants({
												selected,
											})}
										>
											{o.render}
										</div>
									</Box>
								)}
							</Listbox.Option>
						)
					})}
				</Listbox.Options>
				{children}
			</Listbox>
		</Box>
	)
}
