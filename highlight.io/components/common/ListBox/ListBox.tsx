import classNames from 'classnames'
import { useRef } from 'react'
import { useListBox, useOption } from 'react-aria'

export default function ListBox(props: any) {
	let ref = useRef<HTMLUListElement>(null)
	let { listBoxRef = ref, state } = props
	let { listBoxProps } = useListBox(props, state, listBoxRef)

	return (
		<ul
			{...listBoxProps}
			ref={listBoxRef}
			style={{
				margin: 0,
				padding: 0,
				listStyle: 'none',
				overflow: 'auto',
			}}
		>
			{[...state.collection].map((item) => (
				<Option
					key={item.key}
					item={item}
					state={state}
					activeClass={props.activeClass}
				/>
			))}
		</ul>
	)
}

export function Option({
	item,
	state,
	activeClass,
}: {
	item: any
	state: any
	activeClass: string
}) {
	let ref = useRef<any>(null)
	let { optionProps, isSelected, isFocused } = useOption(
		{ key: item.key },
		state,
		ref,
	)

	return (
		<li
			{...optionProps}
			ref={ref}
			className={classNames({ [activeClass]: isSelected || isFocused })}
		>
			{item.rendered}
		</li>
	)
}
