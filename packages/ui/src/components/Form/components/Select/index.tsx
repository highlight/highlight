import React, {
	ButtonHTMLAttributes,
	HTMLAttributes,
	forwardRef,
	useRef,
} from 'react'
import {
	Select as BaseSelect,
	SelectItem as BaseSelectItem,
	SelectArrow,
	SelectPopover,
	useSelectState,
} from 'ariakit/select'

export type SelectProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	name?: string
	value?: string
	setValue?: (value: string) => void
	defaultValue?: string
	required?: boolean
	onTouch?: () => void
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
	({ children, value, setValue, defaultValue, onTouch, ...props }, ref) => {
		const portalRef = useRef<HTMLDivElement>(null)
		const select = useSelectState({
			gutter: 4,
			value,
			setValue,
			defaultValue,
			sameWidth: true,
		})
		return (
			<>
				<BaseSelect
					state={select}
					ref={ref}
					className="select"
					{...props}
					onBlur={(event) => {
						props.onBlur?.(event)
						if (event.defaultPrevented) return
						const popover = select.popoverRef.current
						if (popover?.contains(event.relatedTarget)) return
						onTouch?.()
					}}
				>
					{select.value || 'Select an item'}
					<SelectArrow />
				</BaseSelect>
				<SelectPopover
					state={select}
					modal
					portalRef={portalRef}
					className="popover"
					onBlur={(event) => {
						const portal = portalRef.current
						const disclosure = select.disclosureRef.current
						if (portal?.contains(event.relatedTarget)) return
						if (disclosure?.contains(event.relatedTarget)) return
						onTouch?.()
					}}
				>
					{children}
				</SelectPopover>
			</>
		)
	},
)

export type SelectItemProps = HTMLAttributes<HTMLDivElement> & {
	value?: string
}

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
	(props, ref) => {
		return <BaseSelectItem ref={ref} className="select-item" {...props} />
	},
)
