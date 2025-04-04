import Image from 'next/legacy/image'
import { ReactElement } from 'react'
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { HiGlobeAlt } from 'react-icons/hi'
import { Typography } from '../common/Typography/Typography'
import { Author } from './BlogPost/BlogPost'

const SocialLink = ({
	href,
	icon,
}: {
	href: string
	icon: ReactElement<any>
}) => (
	<a
		href={href}
		className="transition-colors text-copy-on-dark"
		target={'_blank'}
		rel="noreferrer"
	>
		{icon}
	</a>
)

export function PostAuthor({
	profilePhoto,
	firstName,
	lastName,
	title,
	hidePhoto,
	personalWebsiteLink,
	twitterLink,
	githubLink,
	hideTitle,
	linkedInLink,
}: Author & { hidePhoto?: boolean; hideTitle?: boolean }) {
	return (
		<div className="flex gap-3">
			{!hidePhoto && (
				<div className="overflow-hidden rounded-full w-12 h-12 border-solid border-[3px] border-divider-on-dark relative">
					<Image
						src={profilePhoto.url ?? ''}
						layout="fill"
						alt={`Author picture of ${firstName} ${lastName}`}
						objectFit="cover"
					/>
				</div>
			)}
			<div className="flex flex-col items-start">
				<div className="flex items-center gap-2">
					<Typography type="copy3" emphasis>
						{firstName} {lastName}
					</Typography>
					<div className="flex flex-wrap gap-2 pointer-events-auto">
						{personalWebsiteLink && (
							<SocialLink
								href={personalWebsiteLink}
								icon={<HiGlobeAlt />}
							/>
						)}
						{twitterLink && (
							<SocialLink
								href={twitterLink}
								icon={<FaTwitter />}
							/>
						)}
						{githubLink && (
							<SocialLink href={githubLink} icon={<FaGithub />} />
						)}
						{linkedInLink && (
							<SocialLink
								href={linkedInLink}
								icon={<FaLinkedin />}
							/>
						)}
					</div>
				</div>

				{!hideTitle && (
					<Typography type="copy4" className="text-copy-on-dark">
						{title}
					</Typography>
				)}
			</div>
		</div>
	)
}
