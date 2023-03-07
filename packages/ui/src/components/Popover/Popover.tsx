import {
	Popover as AriakitPopover,
	PopoverDisclosure,
	PopoverOptions,
	PopoverState,
	usePopoverState,
} from 'ariakit'
import React from 'react'
import { Button, ButtonProps as ButtonProps } from '../Button/Button'
import { Tag, Props as TagProps } from '../Tag/Tag'
import { Box, BoxProps } from '../Box/Box'

const PopoverContext = React.createContext<PopoverState>({} as PopoverState)
export const usePopover = () => React.useContext(PopoverContext)

export type PopoverProps = React.PropsWithChildren<Partial<PopoverState>>

type PopoverComponent = React.FC<PopoverProps> & {
	ButtonTrigger: typeof ButtonTrigger
	TagTrigger: typeof TagTrigger
	BoxTrigger: typeof BoxTrigger
	Content: typeof Content
}

export const Popover: PopoverComponent = ({
	children,
	...props
}: PopoverProps) => {
	const popoverState = usePopoverState({
		placement: 'bottom',
		gutter: 4,
		...props,
	})

	return (
		<PopoverContext.Provider value={popoverState}>
			{children}
		</PopoverContext.Provider>
	)
}

// TODO: See if we can come up with a generic component that can accommodate as
// `as` prop that preserves types. Separating to separate tag/button components
// for now.
const ButtonTrigger: React.FC<React.PropsWithChildren<ButtonProps>> = ({
	children,
	...props
}) => {
	const popover = usePopover()

	return (
		<PopoverDisclosure state={popover} as={Button} {...props}>
			{children}
		</PopoverDisclosure>
	)
}

const TagTrigger: React.FC<React.PropsWithChildren<TagProps>> = ({
	children,
	...props
}) => {
	const popover = usePopover()

	return (
		<PopoverDisclosure state={popover} as={Tag} {...props}>
			{children}
		</PopoverDisclosure>
	)
}

const BoxTrigger: React.FC<React.PropsWithChildren<BoxProps>> = ({
	children,
	...props
}) => {
	const popover = usePopover()

	return (
		<PopoverDisclosure state={popover} as={Box} {...props}>
			{children}
		</PopoverDisclosure>
	)
}

const Content: React.FC<
	React.PropsWithChildren<Omit<PopoverOptions<'div'>, 'state'>>
> = ({ children, ...props }) => {
	const popover = usePopover()

	return (
		<AriakitPopover state={popover} {...props}>
			{children}
		</AriakitPopover>
	)
}

Popover.ButtonTrigger = ButtonTrigger
Popover.TagTrigger = TagTrigger
Popover.BoxTrigger = BoxTrigger
Popover.Content = Content
