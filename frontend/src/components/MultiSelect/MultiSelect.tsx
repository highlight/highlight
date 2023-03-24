import { Listbox } from '@headlessui/react'
import { Box, IconSolidCheckCircle, IconSolidX } from '@highlight-run/ui'
import { Badge, Text } from '@highlight-run/ui'
import React from 'react'

import * as styles from './MultiSelect.css'

interface Input {
	id: string
	name: string
	render?: string
	count?: number
}

type Props<T extends Input, S extends any[]> = React.PropsWithChildren & {
	options: T[]
	selected: S
	setSelected: React.Dispatch<React.SetStateAction<S>>
	showCancel?: boolean
}

export const MultiSelect = function <T extends Input, S extends any[]>({
	children,
	options,
	selected,
	setSelected,
	showCancel,
}: Props<T, S>) {
	const ButtonText = () => {
		if (selected.length === 0) {
			return <p>Type</p>
		} else if (selected.length === 1) {
			return <p>{selected[0].name}</p>
		} else if (selected.length === 2) {
			return <p>{selected.map((item: T) => item.name).join(', ')}</p>
		} else if (selected.length > 2) {
			return <p>{`${selected.length} types`}</p>
		} else {
			return <></>
		}
	}

	return (
		<Box cssClass={styles.container}>
			<Listbox multiple value={selected} onChange={setSelected}>
				<Listbox.Button>
					<ButtonText />
				</Listbox.Button>
				<Listbox.Options>
					{showCancel && (
						<div
						// onClick={() => {
						// 	setSelected([])
						// }}
						>
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
											<Text size="medium">
												{o.render ? o.render : o.name}
											</Text>
										</div>
										<div>
											<Badge
												label={o.count?.toString()}
											></Badge>
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
