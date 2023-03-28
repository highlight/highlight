interface Role {
	title: string
	content: string
	slug: string
}

export const OPEN_ROLES: { [k: string]: Role } = {
	'marketing-lead': {
		title: 'Marketing Lead / Head of Marketing (Remote)',
		content: `Content in markdown`,
		slug: 'marketing-lead',
	},
}
