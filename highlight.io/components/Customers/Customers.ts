import Basedash from '../../public/images/companies/basedash.png'
import Cabal from '../../public/images/companies/cabal.svg'
import Impira from '../../public/images/companies/impira.png'
import Mage from '../../public/images/companies/mage.png'
import Pipe from '../../public/images/companies/pipe.png'
import Avatar from '../../public/images/john.jpg'
import { CustomerReview } from './CustomerCard/CustomerCard'

export const CUSTOMER_REVIEWS: CustomerReview[] = [
	{
		author: 'Peter from Basedash',
		logo: Basedash,
		body: 'OMG I love Highlight!',
		avatar: Avatar,
	},
	{
		author: 'Charlie from Cabal',
		logo: Cabal,
		body: 'OMG I love Highlight more!',
		avatar: Avatar,
	},
	{
		author: 'Mark from Mage',
		logo: Mage,
		body: 'OMG I love Highlight more and more! This is a longer review. ',
		avatar: Avatar,
	},
	{
		author: 'Patrick from Pipe',
		logo: Pipe,
		body: 'OMG I love Highlight!',
		avatar: Avatar,
	},
	{
		author: 'Irene from Impira',
		logo: Impira,
		body: 'OMG I love Highlight!',
		avatar: Avatar,
	},
]
