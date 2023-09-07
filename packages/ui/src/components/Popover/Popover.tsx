import * as Ariakit from '@ariakit/react'
import React from 'react'
import { Button, ButtonProps as ButtonProps } from '../Button/Button'
import { Tag, Props as TagProps } from '../Tag/Tag'
import { Box, BoxProps } from '../Box/Box'

const PopoverContext = React.createContext<Ariakit.PopoverStore>(
	{} as Ariakit.PopoverStore,
)
export const usePopover = () => React.useContext(PopoverContext)

export type PopoverProps = React.PropsWithChildren<
	Partial<Ariakit.PopoverStoreProps> & {
		store?: Ariakit.PopoverStore
	}
>

type PopoverComponent = React.FC<PopoverProps> & {
	ButtonTrigger: typeof ButtonTrigger
	TagTrigger: typeof TagTrigger
	BoxTrigger: typeof BoxTrigger
	Content: typeof Content
	usePopoverStore: typeof Ariakit.usePopoverStore
}

export const Popover: PopoverComponent = ({
	children,
	...props
}: PopoverProps) => {
	const popoverStore =
		props.store ??
		Ariakit.usePopoverStore({
			placement: 'bottom',
			...props,
		})

	return (
		<PopoverContext.Provider value={popoverStore}>
			{children}
		</PopoverContext.Provider>
	)
}

// TODO: See if we can come up with a generic component that can accommodate an
// `as` prop that preserves types. Creating separate tag/button components as
// a workaround for now.
const ButtonTrigger: React.FC<React.PropsWithChildren<ButtonProps>> = ({
	children,
	...props
}) => {
	const popover = usePopover()

	return (
		<Ariakit.PopoverDisclosure store={popover} as={Button} {...props}>
			{children}
		</Ariakit.PopoverDisclosure>
	)
}

const TagTrigger: React.FC<React.PropsWithChildren<TagProps>> = ({
	children,
	...props
}) => {
	const popover = usePopover()

	return (
		<Ariakit.PopoverDisclosure store={popover} as={Tag} {...props}>
			{children}
		</Ariakit.PopoverDisclosure>
	)
}

const BoxTrigger: React.FC<React.PropsWithChildren<BoxProps>> = ({
	children,
	...props
}) => {
	const popover = usePopover()

	return (
		<Ariakit.PopoverDisclosure store={popover} as={Box} {...props}>
			{children}
		</Ariakit.PopoverDisclosure>
	)
}

const Content: React.FC<
	React.PropsWithChildren<Omit<Ariakit.PopoverOptions<'div'>, 'store'>> & {
		className?: string
	}
> = ({ children, className, ...props }) => {
	const popover = usePopover()

	return (
		<Ariakit.Popover
			{...props}
			className={className}
			store={popover}
			gutter={4}
		>
			{/*
			There is a bug in v0.2.17 of Ariakit where you need to have this arrow
			rendered or else positioning of the popover breaks. We render it, but hide
			it by setting size={0}. This is an issue with anything using a popover
			coming from the floating-ui library.
			*/}
			<Ariakit.PopoverArrow size={0} />
			{children}
		</Ariakit.Popover>
	)
}

Popover.ButtonTrigger = ButtonTrigger
Popover.TagTrigger = TagTrigger
Popover.BoxTrigger = BoxTrigger
Popover.Content = Content
Popover.usePopoverStore = Ariakit.usePopoverStore
