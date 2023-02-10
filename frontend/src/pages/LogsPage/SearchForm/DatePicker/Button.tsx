import clsx from 'clsx'
import { FC, ReactNode } from 'react'

interface ButtonProps {
	className?: string
	children: ReactNode
}

export const Button: FC<ButtonProps> = ({ className, children, ...props }) => {
	const buttonClassName = clsx(
		'flex h-8 items-center justify-center rounded hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50',
		className,
	)
	return (
		<button className={buttonClassName} {...props}>
			{children}
		</button>
	)
}
