import {
	Popover as AriakitPopover,
	PopoverDisclosure,
	PopoverOptions,
	PopoverStore,
	PopoverStoreProps,
	usePopoverStore,
} from '@ariakit/react'
import React from 'react'
import { Button, ButtonProps as ButtonProps } from '../Button/Button'
import { Tag, Props as TagProps } from '../Tag/Tag'
import { Box, BoxProps } from '../Box/Box'

const PopoverContext = React.createContext<PopoverStore>({} as PopoverStore)
export const usePopover = () => React.useContext(PopoverContext)

export type PopoverProps = React.PropsWithChildren<Partial<PopoverStoreProps>>

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
	const popoverStore = usePopoverStore({
		placement: 'bottom',
		...props,
	})

	return (
		<PopoverContext.Provider value={popoverStore}>
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
		<PopoverDisclosure store={popover} as={Button} {...props}>
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
		<PopoverDisclosure store={popover} as={Tag} {...props}>
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
		<PopoverDisclosure store={popover} as={Box} {...props}>
			{children}
		</PopoverDisclosure>
	)
}

const Content: React.FC<
	React.PropsWithChildren<Omit<PopoverOptions<'div'>, 'store'>>
> = ({ children, ...props }) => {
	const popover = usePopover()

	return (
		<AriakitPopover {...props} store={popover} gutter={4}>
			{children}
		</AriakitPopover>
	)
}

Popover.ButtonTrigger = ButtonTrigger
Popover.TagTrigger = TagTrigger
Popover.BoxTrigger = BoxTrigger
Popover.Content = Content
