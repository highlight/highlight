import { CalendarDay, CalendarMonth, CalendarYear } from '@rehookify/datepicker'
import clsx from 'clsx'

export const getDayClassName = (
	className: string,
	{ selected, disabled, inCurrentMonth, now, range }: CalendarDay,
) =>
	clsx('day', className, range, {
		'bg-slate-700 text-white opacity-100 hover:bg-slate-700': selected,
		'cursor-not-allowed opacity-25': disabled,
		'opacity-0': !inCurrentMonth,
		'border border-slate-500': now,
	})

export const getMonthClassName = (
	className: string,
	{ selected, now, disabled }: CalendarMonth,
) =>
	clsx(className, {
		'bg-slate-700 text-white opacity-100 hover:bg-slate-700': selected,
		'border border-slate-500': now,
		'cursor-not-allowed opacity-25': disabled,
	})

export const getYearsClassName = (
	className: string,
	{ selected, now, disabled }: CalendarYear,
) =>
	clsx(className, {
		'bg-slate-700 text-white opacity-100 hover:bg-slate-700': selected,
		'border border-slate-500': now,
		'cursor-not-allowed opacity-25': disabled,
	})
