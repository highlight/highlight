import { StaticImageData } from 'next/legacy/image'
import Basedash from '../../public/images/companies/basedash.png'
import Knock from '../../public/images/companies/knock.png'
import Mage from '../../public/images/companies/mage.png'
import Portal from '../../public/images/companies/portal.png'

import BasedashAvatar from '../../public/images/avatars/basedash.jpg'
import KnockAvatar from '../../public/images/avatars/knock.jpg'
import MageAvatar from '../../public/images/avatars/mage.jpg'
import PortalAvatar from '../../public/images/avatars/portal.jpg'

export interface Review {
	companyLogo: StaticImageData
	text: string
	scale?: number
	author: {
		image: StaticImageData
		name: string
		role: string
	}
}

export const REVIEWS: Review[] = [
	{
		companyLogo: Basedash,
		scale: 1.2,
		text: `Highlight helps us catch bugs that would otherwise go undetected and makes it easy to replicate and debug them.`,
		author: {
			image: BasedashAvatar,
			name: 'Max Musing',
			role: 'Founder & CEO',
		},
	},
	{
		companyLogo: Mage,
		scale: 1,
		text: `Highlight weaves together the incredible, varied, and complex interactions of our users into something understandable and actionable.`,
		author: {
			image: MageAvatar,
			name: 'Kai Hess',
			role: 'Founding Product Designer',
		},
	},
	{
		companyLogo: Knock,
		scale: 0.9,
		text: `I love Highlight because not only does it help me debug more quickly, but it gives me insight into how customers are actually using our product.`,
		author: {
			image: KnockAvatar,
			name: 'Meryl Dakin',
			role: 'Founding Software Engineer',
		},
	},
	{
		companyLogo: Portal,
		text: `Highlight has helped us win over several customers by making it possible for us to provide hands-on support, based on a detailed understanding of what each user was doing.`,
		author: {
			image: PortalAvatar,
			name: 'Neil Raina',
			role: 'CTO',
		},
	},
]
