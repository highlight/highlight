import classNames from 'classnames'
import { BiChevronRight } from 'react-icons/bi'
import { Typography } from '../common/Typography/Typography'
import styles from './Launch.module.scss'

const BoxOverlay = ({
	header,
	subheader,
	badge,
	badgeUnder,
}: {
	header: string
	subheader: string
	badge?: string
	badgeUnder?: boolean
}) => {
	return (
		<div className="absolute bottom-4 px-3">
			<Typography
				className="text-darker-copy-on-dark"
				type="copy4"
				emphasis
			>
				{subheader}
			</Typography>

			<div
				className={`
					${
						badgeUnder
							? 'flex md:flex-col md:gap-1  md:items-start'
							: ''
					} flex flex-row gap-2 items-center`}
			>
				<Typography className="text-white" type="copy2" emphasis>
					{header}
				</Typography>
				{badge && (
					<Typography
						className="flex flex-shrink-0 items-center text-color-selected-light rounded-full bg-color-primary-500 border-[1px] border-color-selected-light px-2 py-[1px]"
						type="copy4"
						emphasis
					>
						{badge}
						<BiChevronRight
							className={classNames(
								styles.chevronRight,
								'h-5 w-5',
							)}
						/>
					</Typography>
				)}
			</div>
		</div>
	)
}

export default BoxOverlay
