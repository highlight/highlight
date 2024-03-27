import { style } from '@vanilla-extract/css'

export const activeSwitch = style({
	background: 'var(--color-purple)',
	boxShadow: '0px -1px 0px 0px rgba(0, 0, 0, 0.32) inset',
})

export const inactiveSwitch = style({
	background: 'var(--color-white)',
	borderColor: 'var(--color-gray-300)',
})
