import classNames from 'classnames'
import { BsGithub } from 'react-icons/bs'
import styles from '../../Home/Home.module.scss'
import { PrimaryButton } from '../Buttons/PrimaryButton'
import { Typography } from '../Typography/Typography'
import { Issue, labels, RoadmapProps, tagToTitle } from './RoadmapUtils'

export const Roadmap = (content: { content: RoadmapProps }) => {
	let data = content.content

	return (
		<>
			<div className="flex flex-col sm:flex-row gap-4 mt-4">
				<PrimaryButton
					href="https://github.com/highlight/highlight/issues/new?assignees=&labels=external+bug+%2F+request&template=feature_request.md&title="
					className={classNames(
						styles.solidButton,
						'inline-block py-[6px] items-center px-3 rounded-md min-w-[185px]',
					)}
				>
					<BsGithub className="inline-block mr-2 mb-[3px] h-[18px]" />
					<Typography type="copy3" emphasis>
						Feature Request
					</Typography>
				</PrimaryButton>
				<PrimaryButton
					href="https://github.com/orgs/highlight/projects/11/views/1"
					className={classNames(
						styles.hollowButton,
						'inline-block py-[6px] px-3 items-center rounded-md min-w-[185px]',
					)}
				>
					<BsGithub className="inline-block mr-2 mb-[3px] h-[18px] " />
					<Typography type="copy3" emphasis>
						View on GitHub
					</Typography>
				</PrimaryButton>
			</div>
			<div className="border-[1px] border-divider-on-dark my-10 w-[300px]" />
			<div className="flex flex-col xl:flex-row w-full gap-16 xl:gap-0">
				<RoadmapColumn
					title="Planned"
					subTitle="The features that have been scoped out for this quarter. Feel free to contribute ideas."
					issues={data?.column1 || []}
				/>
				<RoadmapColumn
					title="In Progress"
					subTitle="Check out what we're currently bringing to life."
					issues={data?.column2 || []}
				/>
				<RoadmapColumn
					title="Shipped 🚢"
					subTitle="What we've delivered so far."
					issues={data?.column3 || []}
				/>
			</div>
		</>
	)
}

const RoadmapColumn = ({
	title,
	subTitle,
	issues,
}: {
	title: string
	subTitle: string
	issues: Issue[]
}) => {
	return (
		<div className="flex w-full flex-col">
			<div className="flex flex-col xl:h-[100px] mb-8 gap-2">
				<Typography type="copy1" emphasis>
					{title}
				</Typography>
				<Typography type="copy3" className="w-10/12 text-copy-on-dark">
					{subTitle}
				</Typography>
			</div>
			<div className="flex flex-col gap-8">
				{labels.map((label, index) => (
					<RoadmapCategory key={index} label={label} items={issues} />
				))}
			</div>
		</div>
	)
}

const RoadmapCategory = ({
	label,
	items,
}: {
	label: string
	items: Issue[]
}) => {
	let filteredItems = items.filter((item) => item.labels.includes(label))

	if (filteredItems.length === 0) {
		return null
	}

	return (
		<div className="xl:w-11/12 text-center border-[1px] border-divider-on-dark rounded-lg">
			<div className="py-2">
				<Typography type="copy3" emphasis>
					{tagToTitle(label)}
				</Typography>
			</div>
			{filteredItems.map((item, index) => (
				<RoadmapItem key={index} {...item} />
			))}
		</div>
	)
}

export const RoadmapItem = ({
	title,
	number,
	link,
	linkText,
	issueReactions,
}: Issue) => {
	return (
		<div className="flex flex-col gap-2 pt-3 border-t-[1px] border-divider-on-dark text-start px-4">
			<a href={link} className="cursor-pointer">
				<Typography type="copy4" emphasis className="text-copy-on-dark">
					{title} <span className="text-color-gray">#{number}</span>
				</Typography>
			</a>

			<div className="flex gap-4">
				{issueReactions &&
					issueReactions.map((reaction, index) => (
						<div key={index} className="flex gap-1 items-center">
							<Typography
								type="copy3"
								emphasis
								className="text-copy-on-dark"
							>
								{reaction.content}
							</Typography>
							<Typography
								type="copy4"
								emphasis
								className="text-copy-on-dark"
							>
								{reaction.count}
							</Typography>
						</div>
					))}
			</div>

			{link && (
				<div className="inline-block">
					<PrimaryButton
						href={link}
						className={classNames(
							'inline-block px-3 py-1 mt-2 items-center mb-4 rounded-md',
							styles.hollowButton,
						)}
					>
						<div className="flex items-center gap-2">
							<BsGithub className="h-[15px]" />
							<Typography type="copy3" emphasis>
								{linkText}
							</Typography>
						</div>
					</PrimaryButton>
				</div>
			)}
		</div>
	)
}
