import classNames from 'classnames'
import Link from 'next/link'
import { AiFillBug } from 'react-icons/ai'
import {
	HiChartPie,
	HiCog,
	HiCollection,
	HiPlay,
	HiTag,
	HiTerminal,
} from 'react-icons/hi'
import { IoIosStopwatch } from 'react-icons/io'

import { ReactElement } from 'react-markdown/lib/react-markdown'
import { Typography } from '../common/Typography/Typography'

export type Tag = {
	name: string
	slug: string
	description: string
}

export const getTagUrl = (slug: string) =>
	slug === 'all' || !slug ? `/blog` : `/blog/tag/${slug}`

function TagIcon({
	slug,
	className,
}: {
	slug: Tag['slug']
	className?: string
}) {
	const iconMap: Record<Tag['slug'], ReactElement> = {
		all: <HiCollection className={className} />,
		'highlight-engineering': <HiCog className={className} />,
		'developer-tooling': <HiTerminal className={className} />,
		'session-replay': <HiPlay className={className} />,
		'debugging-and-troubleshooting': <AiFillBug className={className} />,
		'performance-monitoring': <IoIosStopwatch className={className} />,
		'frontend-monitoring': <HiChartPie className={className} />,
	}

	return iconMap[slug] ?? <HiTag className={className} />
}

export function PostTag({ name, slug }: Pick<Tag, 'name' | 'slug'>) {
	return (
		<Link href={getTagUrl(slug)}>
			<div className="rounded-full bg-white/[12%] w-fit px-3 py-0.5 select-none cursor-pointer hover:bg-copy-on-light transition-colors active:bg-black/25 active:transition-none text-copy-on-dark">
				<Typography type="copy4">{name}</Typography>
			</div>
		</Link>
	)
}

export function SidebarTag({
	name,
	slug,
	current,
}: {
	name: Tag['name']
	slug: Tag['slug']
	current?: boolean
}) {
	return (
		<Link href={getTagUrl(slug)}>
			<div className="flex gap-[3px] items-center text-copy-on-dark h-[30px] select-none cursor-pointer transition-all active:transition-none group hover:bg-divider-on-dark/30 active:bg-dark-background pl-[3px]">
				<TagIcon
					slug={slug}
					className={classNames(
						'transition-all  group-hover:text-copy-on-dark',
						current ? 'text-white' : 'text-copy-on-light',
					)}
				/>
				<Typography
					type="copy3"
					className={classNames(
						'transition-all group-hover:opacity-100 group-hover:text-copy-on-dark',
						current ? 'text-white opacity-100' : 'opacity-70',
					)}
					emphasis={current}
				>
					{name}
				</Typography>
			</div>
		</Link>
	)
}

export function TagTab({
	name,
	slug,
	current,
}: {
	name: Tag['name']
	slug: Tag['slug']
	current?: boolean
}) {
	const tabBaseStyle = classNames(
		'flex gap-2 flex-0 items-center h-[30px] select-none box-content cursor-pointer hover:opacity-100 transition-opacity active:opacity-50 active:transition-none leading-none px-1 pb-2 group border-b-2 border-0 border-solid',
	)

	const tabColorStyle = classNames(
		current
			? 'text-highlight-yellow border-highlight-yellow'
			: 'text-copy-on-dark border-transparent',
	)

	return (
		<Link href={getTagUrl(slug)}>
			<div className={classNames(tabBaseStyle, tabColorStyle)}>
				<span
					className={classNames(
						current
							? 'text-highlight-yellow'
							: 'opacity-70 group-hover:opacity-100 transition-opacity',
						'mt-1',
					)}
				>
					<TagIcon slug={slug} />
				</span>

				<Typography type="copy2" className="w-max" emphasis={current}>
					{name}
				</Typography>
			</div>
		</Link>
	)
}
