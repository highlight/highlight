import { offset, useFloating } from '@floating-ui/react-dom'
import { Menu as HeadlessMenu, Portal, Transition } from '@headlessui/react'
import { cloneElement, Fragment, ReactElement, ReactNode } from 'react'

export function Menu({
	button,
	items,
}: {
	button: ReactElement
	items: ReactNode
}) {
	const { x, y, reference, floating, strategy } = useFloating({
		middleware: [offset(12)],
	})

	return (
		<HeadlessMenu>
			<HeadlessMenu.Button as={Fragment}>
				{cloneElement(button, { ref: reference })}
			</HeadlessMenu.Button>
			<Portal>
				<div
					ref={floating}
					style={{
						position: strategy,
						top: y ?? 0,
						left: x ?? 0,
					}}
				>
					<Transition
						appear
						enter="transition ease-out duration-100 origin-top"
						enterFrom="transform opacity-0 scale-90"
						enterTo="transform opacity-100 scale-100"
						leave="transition ease-in duration-75 origin-top"
						leaveTo="transform opacity-0 scale-90"
						leaveFrom="transform opacity-100 scale-100"
					>
						<HeadlessMenu.Items className="divide-y divide-solid divide-neutral-200 rounded-md border border-solid border-neutral-200 bg-white shadow-lg dark:bg-slate-800">
							{items}
						</HeadlessMenu.Items>
					</Transition>
				</div>
			</Portal>
		</HeadlessMenu>
	)
}

Menu.Item = HeadlessMenu.Item
