import * as Ariakit from '@ariakit/react'
import React from 'react'

import { Box, BoxProps } from '../Box/Box'
import { Button, ButtonProps } from '../Button/Button'
import { Props as TagProps, Tag } from '../Tag/Tag'

export type PopoverProps = React.PropsWithChildren<Ariakit.PopoverProviderProps>

type PopoverComponent = React.FC<PopoverProps> & {
	ButtonTrigger: typeof ButtonTrigger
	TagTrigger: typeof TagTrigger
	BoxTrigger: typeof BoxTrigger
	Content: typeof Content
	useContext: typeof Ariakit.usePopoverContext
	useStore: typeof Ariakit.usePopoverStore
}

export const Popover: PopoverComponent = ({
	children,
	...props
}: PopoverProps) => {
	return (
		<Ariakit.PopoverProvider placement="bottom" {...props}>
			{children}
		</Ariakit.PopoverProvider>
	)
}

// TODO: See if we can come up with a generic component that can accommodate an
// `as` prop that preserves types. Creating separate tag/button components as
// a workaround for now.
const ButtonTrigger: React.FC<React.PropsWithChildren<ButtonProps>> = ({
	children,
	...props
}) => {
	const popover = Ariakit.usePopoverContext()

	return (
		<Ariakit.PopoverDisclosure
			store={popover}
			render={<Button />}
			{...props}
		>
			{children}
		</Ariakit.PopoverDisclosure>
	)
}

const TagTrigger: React.FC<React.PropsWithChildren<TagProps>> = ({
	children,
	...props
}) => {
	const popover = Ariakit.usePopoverContext()

	return (
		<Ariakit.PopoverDisclosure store={popover} render={<Tag />} {...props}>
			{children}
		</Ariakit.PopoverDisclosure>
	)
}

const BoxTrigger: React.FC<
	React.PropsWithChildren<Omit<BoxProps, 'color' | 'type'>>
> = ({ children, ...props }) => {
	const popover = Ariakit.usePopoverContext()

	return (
		<Ariakit.PopoverDisclosure store={popover} render={<Box />} {...props}>
			{children}
		</Ariakit.PopoverDisclosure>
	)
}

const Content: React.FC<
	React.PropsWithChildren<Omit<Ariakit.PopoverOptions<'div'>, 'store'>> & {
		className?: string
	}
> = ({ children, className, ...props }) => {
	const popover = Ariakit.usePopoverContext()

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
Popover.useContext = Ariakit.usePopoverContext
Popover.useStore = Ariakit.usePopoverStore
